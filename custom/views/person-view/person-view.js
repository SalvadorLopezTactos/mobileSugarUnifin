
const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const dialog = require('%app.core%/dialog');
const AddressEditView = require('%app.views%/edit/address-edit-view');
const EditView = require('%app.views.edit%/edit-view');

const AccountEditView = customization.extend(EditView, {
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

            this.model.on('change:name', this.cleanName, this);


        }else{
        //Consultado registro
        //Estableciendo como solo lectura campos de promotores
        this.model.on('sync', this.setPromotores, this);

    	}

    	this.model.on('data:sync:complete', this.setLengthPhone,this); 

        //Validación de teléfono
        this.model.addValidationTask('validatePhoneFormat', _.bind(this.validatePhoneFormat, this));

        this.model.addValidationTask('check_info', _.bind(this.doValidateInfoReq, this));
        
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
}


});

customization.register(AccountEditView,{module: 'Accounts'});

module.exports = AccountEditView;

