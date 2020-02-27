const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const EditView = require('%app.views.edit%/edit-view');

const LeadEditView = customization.extend(EditView, {
	initialize(options) {
		this._super(options);

        this.model.on('change:name_c', this.cleanName, this);        

        //Bloquear registro al tener campo No Contactar
        this.model.on('data:sync:complete', this.blockLeadConvertido,this);

        //Validación de duplicados
        this.model.addValidationTask('duplicate_check_leads', _.bind(this.duplicateCheckLeads, this));
        
    },

    cleanName: function(){

        //Recupera variables
        var original_name = this.model.get("name_c");
        // console.log("CleanName "+original_name);
        var list_check = app.lang.getAppListStrings('validacion_duplicados_list');
        var simbolos = app.lang.getAppListStrings('validacion_simbolos_list');
        //Define arreglos para guardar nombre de lead
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

        if (this.model.get('regimen_fiscal_c') == "Persona Moral") {
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

            //Valida que exista más de un elemento, caso contrario establece para clean_name_c valores con tipo de sociedad
            if ((clean_name_split.length - totalVacio) <= 1) {
                clean_name = "";
                _.each(clean_name_split_full, function (value, key) {
                    clean_name += value;
                });
            }
            clean_name = clean_name.toUpperCase();
            this.model.set("clean_name_c", clean_name);
        } else {
            original_name = original_name.replace(/\s+/gi, '');
            original_name = original_name.toUpperCase();
            this.model.set("clean_name_c", original_name);
        }
    },

    blockLeadConvertido:function(){

	    if (this.model.get('subtipo_registro_c') == '4') {

	            //Bloquear el registro completo y mostrar alerta
	            $('.field').addClass('field--readonly');
	            $('.field').attr('style','pointer-events:none');
	           
	            app.alert.show("lead_convertido", {
	                level: "error",
	                messages: "Lead No Editable\nEste registro ha sido bloqueado pues ya ha sido Convertido",
	                autoClose: false
	            });

	    }
	},

	duplicateCheckLeads: function (fields, errors, callback) {
		self=this;
		if(_.isEmpty(errors)){
			//Valida homonimo
			if (this.model.get('subtipo_registro_c')!= '3' && this.model.get('subtipo_registro_c')!= '4') {

				var clean_name_lead = this.model.get('clean_name_c');
				app.alert.show('validando_duplicados', {
					level: 'process',
					messages: 'Cargando...'
				});

				app.api.call("read", app.api.buildURL("Accounts/", null, null, {
					fields: "clean_name",
					max_num: 5,
					"filter": [
					{
						"clean_name": clean_name_lead,
						"id": {
							$not_equals: this.model.id,
						}
					}
					]
				}), null, {
					success: _.bind(function (data) {
						app.alert.dismiss('validando_duplicados');
						if (data.records.length > 0) {

							errors['nombre_c'] = errors['nombre_c'] || {};
							errors['nombre_c'].required = true;

							callback(null, fields, errors);
							if(!_.isEmpty(errors)){
								app.alert.show("duplicateCheck_leads_mssg", {
									level: "error",
									messages: "El registro que intentas guardar ya existe como Cuenta",
									autoClose: false
								});
							}

						}else{
							var name_lead_clean = self.model.get('clean_name_c');
							app.alert.show('validando_duplicados', {
								level: 'process',
								messages: 'Cargando...'
							});
							app.api.call("read",app.api.buildURL("Leads/",null,null,{
								fields: "clean_name_c",
								max_num: 5,
								"filter": [{
									"clean_name_c": name_lead_clean,
									"id": {
										$not_equals: self.model.id,
									}
								}
								]

							}),null,{
								success:_.bind(function(data){
									app.alert.dismiss('validando_duplicados');
									if(data.records.length>0){

										errors['nombre_c'] = errors['nombre_c'] || {};
										errors['nombre_c'].required = true;
									}

									callback(null, fields, errors);
									if(!_.isEmpty(errors)){
										app.alert.show("duplicateCheck_leads_mssg_1",{
											level: "error",
											messages: "El registro que intentas guardar ya existe como Lead",
											autoClose: false
										});
									}

								},self)

                    	});//Fin api call
						}

					}, self)
				});
			} else {
				callback(null, fields, errors);
			}
		}else{
			callback(null, fields, errors);
		}
    }

});
customization.register(LeadEditView,{module: 'Leads'});

module.exports = LeadEditView;

