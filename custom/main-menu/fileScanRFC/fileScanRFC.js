const app = SUGAR.App;
const customization = require('%app.core%/customization');
const NomadView = require('%app.views%/nomad-view');
const device = require('%app.core%/device');
const dialog = require('%app.core%/dialog');

customization.registerMainMenuItem({
    label: 'Crear Cuenta desde QR',
    iconKey: 'actions.barcode',
    rank: 0,
    route:'image_qr_rfc',
    isVisible() {
        //return app.isNative;
        return true;
    },
});

customization.registerRecordAction({
    name: 'scan_qr_main',
    modules: ['Accounts'],
    types: ['right-menu-detail'],
    label: 'Actualizar Cuenta desde QR',
    iconKey: 'actions.barcode',
    rank: 1,

    handler(view, model) {
        //Mandar mensaje de cuenta no contactable y evitar cualquier acción
        if(model.get('tct_no_contactar_chk_c')){
            app.alert.show("cuentas_no_contactar", {
                level: "error",
                messages: "Cuenta No Contactable\nCualquier duda o aclaraci\u00F3n, favor de contactar al \u00E1rea de Administraci\u00F3n de cartera",
                autoClose: false
            });

        }else{
            app.controller.loadScreen({
                view: ScanQRView,
                data:{
                    from:'detalle',
                    idCuenta:model.get('id')
                }
            });
        }
    },
});

customization.registerRoutes([{
    name: 'scanQR',      // Uniquely identifies the route
    steps: 'image_qr_rfc',     // Route hash fragment: '#hello'

    handler(options) {
        app.controller.loadScreen({
            isDynamic: true,
            view: ScanQRView,
            data:{
                from:'creacion',
                idCuenta:''
            }
        });
    }   
}]);

//Definición de nueva vista para edición de Ubicaciones
let ScanQRView = customization.extend(NomadView, {
    // Se especifica el nombre de la vista hbs
    template: 'fileScanRFC',

    // Configure the header
    headerConfig: {
        title: 'Escaneo de RFC',
        buttons: {
            mainMenu: true
        },
    },

    events:{
        'click #send_request': 'sendRequestRFC',
        'click #boton': 'openDialogFile',
        'change #file_rfc':'setImagePreview'
    },

    initialize(options) {
        this.desdeCualVista=options.data;
        self = this;
        this._super(options);

    },

    onAfterRender(){
        //this.abrirDialogoSeleccion();
        $('#boton').trigger('click');
    },

    sendRequestRFC(event){
        //Obtener extensión del archivo elegido solo aceptar (jpg,jpeg y png);
        var extension=self.getFileExt($('#file_rfc')[0].files[0]);
        if(extension != 'png' && extension != 'jpg' && extension != 'jpeg'){

            app.alert.show('error_extension', {
                level: 'error',
                messages: 'Archivo no soportado, favor de elegir imagen con extensión jpg, jpeg o png',
                autoClose: true
            });
            $('#send_request').addClass('disabled');
            $('#send_request').css('pointer-events','none');
        }else{
            app.alert.show('getInfoRFC', {
                level: 'load',
                closeable: false,
                messages: app.lang.get('LBL_LOADING'),
            });

            $('#send_request').addClass('disabled');
            $('#send_request').css('pointer-events','none');

            //var base_64_str=self.getBase64Image(document.getElementById('imageRFC_QR'));
            var c = document.createElement('canvas');
            var ctx = c.getContext('2d');
            var imgn = new Image;
            var imageData='';
            imgn.src = URL.createObjectURL($('#file_rfc')[0].files[0]);
            imgn.onload = function () {
                c.width = imgn.width;
                c.height = imgn.height;
                ctx.drawImage(imgn, 0, 0);
                var imageData = c.toDataURL('image/png');
                var body={
                    "file":$('#imageRFC_QR').attr('src')
                }

                app.api.call('create', app.api.buildURL("GetInfoRFCbyQR"), body, {
                    success: _.bind(function (data) {
                        app.alert.dismiss('getInfoRFC');
                        if(data !=null){
                            if (data[0]['Mensaje de error']!=undefined) {
                                
                                app.alert.show('error_rfc', {
                                    level: 'error',
                                    messages: data[0]['Mensaje de error'],
                                    autoClose: true
                                    }
                                );
                                //Habilitando nuevamente el botón de enviar
                                $('#send_request').removeClass('disabled');
                                $('#send_request').css('pointer-events','auto');
                            }else{
                                var contextoQR=self;
                                //Comprobar que el RFC no existe para poder crear o actualizar el registro
                                 app.alert.show('validando_duplicados', {
                                    level: 'load',
                                    messages: 'Cargando...'
                                });
                                 contextoQR.data=data;

                                 var urlCuentas= app.api.buildURL("Accounts/", null, null, {
                                    fields: "rfc_c",
                                    max_num: 5,
                                    "filter": [
                                    {"rfc_c": data[0]['RFC']}
                                    ]
                                });
                                 app.api.call("read", urlCuentas , null, {
                                    success: _.bind(function (data) {
                                        app.alert.dismiss('validando_duplicados');
                                        //Se encontró que RFC ya se encuentra dado de alta
                                        if (data.records.length > 0) {

                                            dialog.showConfirm('EL RFC que se está intentando obtener ya se encuentra en el sistema\n¿Desea Consultarlo?', {
                                                callback: function(index) {
                                                    if (index === 2) {//Aceptar
                                                        app.controller.navigate({
                                                            url: 'Accounts/'+data.records[0].id
                                                        });  
                                                    }
                                                }
                                            });
                                            
                                        }else{
                                            //No se encontró rfc, por lo tanto, el proceso sigue para crear o actualizar Cuenta
                                            app.alert.show('success_rfc', {
                                                level: 'success',
                                                messages: 'Información cargada correctamente',
                                                autoClose: true
                                            }
                                            );

                                            if(self.desdeCualVista.from=='creacion'){
                                                dialog.showAlert('Será redirigido a la creación de la Cuenta', {
                                                    title: 'Información cargada correctamente',
                                                    buttonLabels: 'Aceptar'
                                                });

                                                app.controller.navigate({
                                                    url: 'Accounts/create',
                                                    data:{
                                                        dataFromQR:contextoQR.data[0]
                                                    }
                                                });
                                            }else{

                                                dialog.showAlert('Será redirigido a la actualización de la Cuenta', {
                                                    title: 'Información cargada correctamente',
                                                    buttonLabels: 'Aceptar'
                                                });

                                                app.controller.navigate({
                                                    url: 'Accounts/'+self.desdeCualVista.idCuenta+'/edit',
                                                    data:{
                                                        dataFromQR:contextoQR.data[0],
                                                        vista:'edit'
                                                    }
                                                });

                                            }
                                        }
                                    }, self)
                                });
                            }
                        }else{
                            app.alert.show('error_rfc', {
                                    level: 'error',
                                    messages: 'La información no se procesó correctamente, favor de elegir otra imagen',
                                    autoClose: true
                                    }
                            );
                            $('#send_request').removeClass('disabled');
                            $('#send_request').css('pointer-events','auto');

                        }  
                    }, self),
                    error: _.bind(function (response) {
                        app.alert.dismiss('getInfoRFC');
                        app.alert.show('error_rfc', {
                                    level: 'error',
                                    messages: response.textStatus+'\nSe superó el tiempo de espera, favor de intentar nuevamente',
                                    autoClose: true
                                    }
                            );
                        $('#send_request').removeClass('disabled');
                        $('#send_request').css('pointer-events','auto');
                    },self)
                },{timeout:90000});
            }
        }
    },

    getFileExt(campo) {
        var name=campo.name;
        var lastDot = name.lastIndexOf('.');
        var fileName = name.substring(0, lastDot);
        var ext = name.substring(lastDot + 1);

        return ext;
    },

    openDialogFile(e){
        $('#file_rfc').trigger('click');
    },

    setImagePreview(e){
        self.readURL($(e.currentTarget)[0]);
        $('#send_request').removeClass('disabled');
        $('#send_request').css('pointer-events','auto');
    },

    readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            
            reader.onload = function (e) {
                $('#imageRFC_QR').attr('src', e.target.result);
            }
            
            reader.readAsDataURL(input.files[0]);
        }
    },

    abrirDialogoSeleccion(){
        var msj = "¿De donde desea obtener la imagen para escanear?";
        var titulo = "Scan RFC";
        var buttonLabels = "Obtener de Galería,Tomar fotografía";
        navigator.notification.confirm(msj, confirmCallback, titulo, buttonLabels);
        //Fotografia - 2, Galeria -1
        function confirmCallback(buttonIndex) {
            if(buttonIndex==2){
                self.camaraTomarFoto();
            }else{
                self.elegirFotoGaleria();
            }
        }
    },

    camaraTomarFoto() {

        var srcType = Camera.PictureSourceType.CAMERA;
        var options = self.setOptionsCamera(srcType);

        navigator.camera.getPicture(onSuccess, onFail, options);

        function onSuccess(imageData) {
            var image = document.getElementById('imageRFC_QR');
            image.src = "data:image/jpeg;base64," + imageData;
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        } 
    },

    elegirFotoGaleria(){

        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = self.setOptionsCamera(srcType);

        navigator.camera.getPicture(
            onSuccess, 
            onFail,
            options
        );

        function onSuccess(imageURL) {
            var image = document.getElementById('imageRFC_QR');
            image.src = imageURL;
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
    },

    setOptionsCamera(srcType) {
        var options = {
            // Some common settings are 20, 50, and 100
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            // In this app, dynamically set the picture source, Camera or photo gallery
            sourceType: srcType,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.CAMERA,
            allowEdit: true,
            correctOrientation: true  //Corrects Android orientation quirks
        }
        
        return options;
    },

    getBase64Image(img) {
        var c = document.createElement('canvas');
        var ctx = c.getContext('2d');
        var imgn = new Image;
        var imageData='';
        imgn.src = URL.createObjectURL($('#file_rfc')[0].files[0]);
        imgn.onload = function () {
            c.width = imgn.width;
            c.height = imgn.height;
            ctx.drawImage(imgn, 0, 0);
            var imageData = c.toDataURL('image/png');
        }
        return imageData;
    }
    
});

module.exports = ScanQRView;

