const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const TextField = require('%app.fields%/text-field');
// Declare 'signature' type field.
const NoViableField = customization.extend(TextField, {

    events: {
        'change #checkbox_no_viable': 'muestraRazonNoViable',
        'change #razon_nv_leasing': 'showFueraPerfil',
    },

    initialize(options) {

        this._super(options);
        this.getListValuesNoViable();
    },

    getListValuesNoViable(){

        selfListas=this;
        app.alert.show('getlists', {
                level: 'process',
                messages: 'Cargando...'
            });
        app.api.call('GET', app.api.buildURL('GetDropdownList/razones_ddw_list,fuera_de_perfil_ddw_list,no_producto_requiere_list,razones_cf_list,tct_razon_ni_l_ddw_c_list'), null, {
                success: _.bind(function (data) {
                    app.alert.dismiss('getlists');
                    if (data) {
                        selfListas.razones_ddw_list=data['razones_ddw_list'];
                        selfListas.fuera_de_perfil_ddw_list = data['fuera_de_perfil_ddw_list'];
                        selfListas.no_producto_requiere_list = data['no_producto_requiere_list'];
                        selfListas.razones_cf_list = data['razones_cf_list'];
                        selfListas.tct_razon_ni_l_ddw_c_list =data['tct_razon_ni_l_ddw_c_list']; 
                    }
                }, self),
            });

    },

    muestraRazonNoViable(e){
        var valor=$('#checkbox_no_viable:checked').val();
        if(valor=='on'){
            $('#razon_nv_leasing').parent().parent().removeClass('hide');
        }else{
            //$('#razon_nv_leasing').parent().parent().addClass('hide');
            $('.noViable').addClass('hide');
            //Se ocultan todos los campos dependientes pertenecientes a la clase noViable
            //$('.noViable').hide();
        }

    },

    showFueraPerfil(e){
        var valor=$(e.currentTarget).val();
        if(valor=='1'){
            $('#fuera_perfil_razon').parent().parent().removeClass('hide');
        }else{
            $('#fuera_perfil_razon').parent().parent().addClass('hide');
        }

    },

    onBeforeRender(){
        //this.razones_ddw_list={'1':'UNO','2':'DOS'};
        //this.razones_ddw_list = app.lang.getAppListStrings('razones_ddw_list');
    }
   
});

customization.register(NoViableField, { metadataType: 'no_viable' });

module.exports = NoViableField;