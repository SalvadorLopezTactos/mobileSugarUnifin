const app = SUGAR.App;
const customization = require('%app.core%/customization');
const NomadView = require('%app.views%/nomad-view');
const device = require('%app.core%/device');
const dialog = require('%app.core%/dialog');

customization.registerMainMenuItem({
    label: 'Scaneo de QR',
    iconKey: 'actions.barcode',
    rank: 0,
    route:'image_qr_rfc',
    isVisible() {
        //return app.isNative;
        return true;
    },
});

customization.registerRoutes([{
    name: 'scanQR',      // Uniquely identifies the route
    steps: 'image_qr_rfc',     // Route hash fragment: '#hello'

    handler(options) {
        app.controller.loadScreen({
            isDynamic: true,
            view: ScanQRView,
        });
    }   
}]);

//Definición de nueva vista para edición de Ubicaciones
let ScanQRView = customization.extend(NomadView, {
    // Se especifica el nombre de la vista hbs
    template: 'fileScanRFC',

    // Configure the header
    headerConfig: {
        title: 'Scaneo de RFC',
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
        self = this;
        this._super(options);
    },

    onAfterRender(){
        //this.abrirDialogoSeleccion();
        $('#boton').trigger('click');
    },

    sendRequestRFC(event){
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
                "file":imageData
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

                            app.alert.show('success_rfc', {
                                level: 'success',
                                messages: 'Información cargada correctamente',
                                autoClose: true
                                }
                            );

                            dialog.showAlert('Será redirigido a la creación de la Cuenta', {
                                title: 'Información cargada correctamente',
                                buttonLabels: 'Aceptar'
                            });

                            app.controller.navigate({
                                url: 'Accounts/create',
                                data:{
                                    dataFromQR:data[0]
                                }
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
            });
        }

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

