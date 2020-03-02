
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const dialog = require('%app.core%/dialog');
const AddressEditView = require('%app.views%/edit/address-edit-view');
const EditView = require('%app.views.edit%/edit-view');

const AccountEditView = customization.extend(EditView, {

    events: {
        'keyup ._numeric': 'setLengthCurrency' 
    },

	initialize(options) {
		this._super(options);

        //Condición para conocer si se el registro es nuevo o ya ha sido creado
        //if(this.model.get('id') == "" || this.model.get('id')==undefined){
        	if(this.isCreate){
            //Creando registro  
            var strUrl = 'Users/' + this.model.get('assigned_user_id');
            self=this;
            app.api.call('GET', app.api.buildURL(strUrl), null, {
            	success: _.bind(function (modelo) {
                        //OBTENIENDO PRODUCTOS
                        var productos=modelo.productos_c;
                        if(productos.length>0){
                        	if(productos.indexOf("1") !== -1){
                        		self.model.set('promotorleasing_c',modelo.name);
                        		self.model.set('user_id_c', modelo.id);
                        	}else{
                        		self.model.set('promotorleasing_c','9 - Sin Gestor');
                        		self.model.set('user_id_c','569246c7-da62-4664-ef2a-5628f649537e');
                        	}
                        	if(productos.indexOf("4") !== -1){
                                self.model.set('promotorfactoraje_c',modelo.name);
                                self.model.set('user_id1_c',modelo.id);
                        	}else{
                                self.model.set('promotorfactoraje_c','9 - Sin Gestor');
                                self.model.set('user_id1_c','569246c7-da62-4664-ef2a-5628f649537e');
                        	}
                        	if(productos.indexOf("3") !== -1){
                        		self.model.set('promotorcredit_c',modelo.name);
                        		self.model.set('user_id2_c',modelo.id);
                        	}else {
                        		self.model.set('promotorcredit_c','9 - Sin Gestor');
                        		self.model.set('user_id2_c','569246c7-da62-4664-ef2a-5628f649537e');
                        	}
                            //if(contains.call(modelo.get('productos_c'), "1")==false && contains.call(modelo.get('productos_c'), "3") == false && contains.call(modelo.get('productos_c'), "4") == false){
                            	if(productos.indexOf("1") == -1 && productos.indexOf("3") == -1 && productos.indexOf("4") == -1){
                            		self.model.set('promotorleasing_c','9 - Sin Gestor');
                            		self.model.set('user_id_c','569246c7-da62-4664-ef2a-5628f649537e');
                            		//self.model.set('promotorfactoraje_c', 'Maria de Lourdes Campos Toca');
                                    //self.model.set('user_id1_c', 'a04540fc-e608-56a7-ad47-562a6078519d');
                                    self.model.set('promotorfactoraje_c', '9 - Sin Gestor');
                                    self.model.set('user_id1_c', '569246c7-da62-4664-ef2a-5628f649537e');
                            		self.model.set('promotorcredit_c','9 - Sin Gestor');
                            		self.model.set('user_id2_c','569246c7-da62-4664-ef2a-5628f649537e');
                            	}
                            }
                            self._hideGuardar(modelo);

                        }, self)
            });


        }else{
        //Consultado registro
        //Estableciendo como solo lectura campos de promotores
            this.model.on('sync', this.setPromotores, this);

    	}

        this.model.on('change:name', this.cleanName, this);

        this.model.on('data:sync:complete', this.setLengthPhone,this);
        //Bloquear registro al tener campo No Contactar
        this.model.on('data:sync:complete', this.blockRecordNoContactar,this);

        //Validación de teléfono
        this.model.addValidationTask('validatePhoneFormat', _.bind(this.validatePhoneFormat, this));

        this.model.addValidationTask('check_info', _.bind(this.doValidateInfoReq, this));
        //Validación para caracteres especiales en campos de nombres
        this.model.addValidationTask('check_TextOnly', _.bind(this.checkTextOnly, this));

        //Validación de duplicados
        this.model.addValidationTask('duplicate_check', _.bind(this.DuplicateCheck, this));
        
    },

    setLengthCurrency:function(e){
        //Se establece longitud máxima para campos de moneda
        $(e.currentTarget).attr('maxlength','15');
    },

    cleanName: function(){

        //Recupera variables
        var original_name = this.model.get("name");
        var list_check = app.lang.getAppListStrings('validacion_duplicados_list');
        var simbolos = app.lang.getAppListStrings('validacion_simbolos_list');
        //Define arreglos para guardar nombre de cuenta
            var clean_name_split = [];
            var clean_name_split_full = [];
            clean_name_split = original_name.split(" ");
            //Elimina simbolos: Ej. . , -
            _.each(clean_name_split, function (value, key) {
                _.each(simbolos, function (simbolo, index) {
                    var clean_value = value.split(simbolo).join('');
                    if (clean_value != value) {
                        clean_name_split[key] = clean_value;
                    }
                });
            });
            clean_name_split_full = App.utils.deepCopy(clean_name_split);

        if (this.model.get('tipodepersona_c')=="Persona Moral") {
            //Elimina tipos de sociedad: Ej. SA, de , CV...
            var totalVacio = 0;
            _.each(clean_name_split, function (value, key) {
                _.each(list_check, function (index, nomenclatura) {
                    var upper_value = value.toUpperCase();
                    if (upper_value == nomenclatura) {
                        var clean_value = upper_value.replace(nomenclatura, "");
                        clean_name_split[key] = clean_value;
                    }
                });
            });
            //Genera clean_name con arreglo limpio
            var clean_name = "";
            _.each(clean_name_split, function (value, key) {
                clean_name += value;
                //Cuenta elementos vacíos
                if (value == "") {
                    totalVacio++;
                }
            });

            //Valida que exista más de un elemento, caso cotrarioe establece para clean_name valores con tipo de sociedad
            if ((clean_name_split.length - totalVacio) <= 1) {
                clean_name = "";
                _.each(clean_name_split_full, function (value, key) {
                    clean_name += value;
                });
            }
            clean_name = clean_name.toUpperCase();
            this.model.set("clean_name", clean_name);
        }else{
            original_name = original_name.replace(/\s+/gi,'');
            original_name= original_name.toUpperCase();
            this.model.set("clean_name", original_name);
        }
    },

    _hideGuardar: function(modelo){

	//Agregando longitud máxima a campo de teléfono
	$('input[type="tel"]').attr('maxlength',"10");

	var tipo = this.model.get('tipo_registro_c');
	var puesto = modelo.puestousuario_c;
      //var puesto = app.user.attributes.type;

      if((tipo=="Prospecto" || tipo=="Cliente") && (puesto==6 || puesto==12 || puesto==17))
      {
      	$(".header__btn--save").addClass("hide")
      }
      else
      {
      	$(".header__btn--save").removeClass("hide")
      }

  },

  setPromotores: function () {

  	$('.promotor_class').attr('style','pointer-events: none;');

},

blockRecordNoContactar:function(){

    if (this.model.get('tct_no_contactar_chk_c') == true) {

            //Bloquear el registro completo y mostrar alerta
            $('.field').addClass('field--readonly');
            $('.field').attr('style','pointer-events:none');

            //Bloqueo de botón Guardar
            $('.header__btn--save ').addClass('disabled').attr('style','pointer-events:none');
           
            app.alert.show("cuentas_no_contactar", {
                level: "error",
                messages: "Cuenta No Contactable\nCualquier duda o aclaraci\u00F3n, favor de contactar al \u00E1rea de Administraci\u00F3n de cartera",
                autoClose: false
            });

    }

},

setLengthPhone:function(){

	//Agregando longitud máxima a campo de teléfono
    $('input[type="tel"]').attr('maxlength',"10");

},

validatePhoneFormat:function(fields, errors, callback){

	var expreg =/^[0-9]{8,10}$/;

	if( this.model.get('phone_office') != "" && this.model.get('phone_office') != undefined){

		if(!expreg.test(this.model.get('phone_office'))){
			errors['phone_office'] = {'required':true};
			errors['phone_office']= {'Formato incorrecto, el tel\u00E9fono debe contener entre 8 y 10 d\u00EDgitos.':true};
		}

		var cont=0;

		var lengthTel=this.model.get('phone_office').length;
		var num_tel=this.model.get('phone_office');
	
		//Checando número de teléfono con únicamente caracteres repetidos
		var arr_nums_tel=num_tel.split(num_tel.charAt(0));

		if( arr_nums_tel.length-1 == lengthTel ){
		errors['phone_office'] = {'required':true};
		errors['phone_office']= {'Tel\u00E9fono Inv\u00E1lido, caracteres repetidos':true};
		}

	}

		              
    callback(null, fields, errors);   

},

doValidateInfoReq:function(fields, errors, callback){

    if (this.model.get('origendelprospecto_c') == 'Prospeccion propia') {
            var metodoProspeccion = new String(this.model.get('metodo_prospeccion_c'));
            if (metodoProspeccion.length == 0 || this.model.get('metodo_prospeccion_c') == null) {
                /*app.alert.show("Metodo de Prospeccion Requerido", {
                    level: "error",
                    title: "Debe indicar el metodo de prospecci\u00F3n",
                    autoClose: false
                });*/
                errors['metodo_prospeccion_c'] = errors['metodo_prospeccion_c'] || {};
                errors['metodo_prospeccion_c'].required = true;
            }
        }
        callback(null, fields, errors);
},

checkTextOnly:function(fields, errors, callback){

        var camponame= "";
        var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
        if (this.model.get('primernombre_c')!="" && this.model.get('primernombre_c')!=undefined){
            var nombre=this.model.get('primernombre_c');
            var comprueba = expresion.test(nombre);
            if(comprueba!= true){
                camponame= camponame + '-Primer Nombre\n';
                errors['primernombre_c'] = errors['primernombre_c'] || {};
                errors['primernombre_c'].required = true;
            }
        }
        if (this.model.get('apellidopaterno_c')!="" && this.model.get('apellidopaterno_c')!= undefined){
            var apaterno=this.model.get('apellidopaterno_c');
            var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
            var validaap = expresion.test(apaterno);
            if(validaap!= true){
                camponame= camponame + '-Apellido Paterno\n';
                errors['apellidopaterno_c'] = errors['apellidopaterno_c'] || {};
                errors['apellidopaterno_c'].required = true;
            }
        }
        if (this.model.get('apellidomaterno_c')!="" && this.model.get('apellidomaterno_c')!= undefined){
            var amaterno=this.model.get('apellidomaterno_c');
            var expresion = new RegExp(/^[a-zA-ZÀ-ÿ\s]*$/g);
            var validaam = expresion.test(amaterno);
            if(validaam!= true){
                camponame= camponame + '-Apellido Materno\n';
                errors['apellidomaterno_c'] = errors['apellidomaterno_c'] || {};
                errors['apellidomaterno_c'].required = true;
            }
        }
        callback(null, fields, errors);

        if (camponame && !_.isEmpty(errors)){
            //Se utiliza dialog ya que al utilizar app.alert.show, como entra en función callback
            //el msj se oculta y no se alcanza a ver el detalle del error
            dialog.showAlert('Los siguientes campos no permiten caracteres especiales:\n'+ camponame);
        }
},

DuplicateCheck: function (fields, errors, callback) {

    //Aplicar validación solo cuando ya no existen campos requeridos por llenar
    if(_.isEmpty(errors)){

        //Valida homonimo
        if (this.model.get('tct_homonimo_chk_c') != true) {
            var clean_name = this.model.get('clean_name');

            app.alert.show('validando_duplicados', {
                level: 'process',
                messages: 'Cargando...'
            });

            app.api.call("read", app.api.buildURL("Accounts/", null, null, {
                fields: "clean_name",
                max_num: 5,
                "filter": [
                    {
                        "clean_name": clean_name,
                        "id": {
                            $not_equals: this.model.id,
                        }
                    }
                ]
            }), null, {
                success: _.bind(function (data) {
                    app.alert.dismiss('validando_duplicados');
                    if (data.records.length > 0) {
                        var usuarios = App.lang.getAppListStrings('usuarios_homonimo_name_list');
                        var etiquetas = "";
                        Object.keys(usuarios).forEach(function (key) {
                            if (key != '') {
                                etiquetas += usuarios[key] + '<br>';
                            }
                        });
                        errors['primernombre_c'] = errors['primernombre_c'] || {};
                        errors['primernombre_c'].required = true;

                        //Se muestra alerta de esta manera ya que al llegar al callback, el alert.show se oculta y no es posible ver el detalle del error
                        dialog.showAlert("Ya existe una persona registrada con el mismo nombre.\nFavor de comunicarse con alguno de los siguientes usuarios:\n" + etiquetas + "");

                        if(!_.isEmpty(errors)){

                            app.alert.show("DuplicateCheck", {
                                level: "error",
                                messages: "Ya existe una persona registrada con el mismo nombre.\nFavor de comunicarse con alguno de los siguientes usuarios:\n" + etiquetas + "",
                                autoClose: false
                            });
                                    
                        }
                    }
                    callback(null, fields, errors);
                }, this)
            });
        } else {
            callback(null, fields, errors);
        }

    }else{

        callback(null, fields, errors);

    }
    
}

});

customization.register(AccountEditView,{module: 'Accounts'});

module.exports = AccountEditView;

