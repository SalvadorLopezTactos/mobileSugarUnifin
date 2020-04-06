const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const TextField = require('%app.fields%/text-field');
// Declare 'signature' type field.
const NoViableField = customization.extend(TextField, {

    events: {
        'change #checkbox_no_viable': 'muestraRazonNoViable',
        'change #checkbox_no_viable_factoraje': 'muestraRazonNoViable',
        'change #checkbox_no_viable_credito': 'muestraRazonNoViable',
        'change #checkbox_no_viable_fleet': 'muestraRazonNoViable',
        'change #checkbox_no_viable_uniclick': 'muestraRazonNoViable',
        'change #razon_nv_leasing': 'showRazonDependiente',
        'change #razon_nv_factoraje': 'showRazonDependiente',
        'change #razon_nv_credito': 'showRazonDependiente',
        'change #razon_nv_fleet': 'showRazonDependiente',
        'change #razon_nv_uniclick': 'showRazonDependiente',
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
                    if (data) {
                        selfListas.razones_ddw_list=data['razones_ddw_list'];
                        selfListas.fuera_de_perfil_ddw_list = data['fuera_de_perfil_ddw_list'];
                        selfListas.no_producto_requiere_list = data['no_producto_requiere_list'];
                        selfListas.razones_cf_list = data['razones_cf_list'];
                        selfListas.tct_razon_ni_l_ddw_c_list =data['tct_razon_ni_l_ddw_c_list']; 
                    }
                    app.alert.dismiss('getlists');
                }, self),
            });

    },

    muestraRazonNoViable(e){
        //var valor=$('#checkbox_no_viable:checked').val();
        var valor=e.currentTarget.checked;
        if(valor){
            //$('#razon_nv_leasing').parent().parent().removeClass('hide');
            $(e.currentTarget).parent().parent().next().removeClass('hide');

        }else{
            //Se ocultan todos los campos dependientes pertenecientes a la clase noViable
            //En caso de desactivar el check "No viable", únicamente se ocultan campos 'hijos' del respectivo producto
            $(e.currentTarget).parent().parent().parent().children('.noViable').addClass('hide');
        }

    },

    showRazonDependiente(e){
        var valor=$(e.currentTarget).val();
        if(valor=='1'){//Fuera de Perfil
            $(e.currentTarget).parent().parent().next().removeClass('hide');

        }else{
            $(e.currentTarget).parent().parent().next().addClass('hide');
        }

        if(valor=='2'){//Condiciones financieras
            $(e.currentTarget).parent().parent().parent().children('.condicionesFinancieras').removeClass('hide');

        }else{
            $(e.currentTarget).parent().parent().parent().children('.condicionesFinancieras').addClass('hide');
        }

        if(valor=='3'){//Ya está con la competencia
            $(e.currentTarget).parent().parent().parent().children('.competencia_quien').removeClass('hide');
            $(e.currentTarget).parent().parent().parent().children('.competencia_porque').removeClass('hide');
        }else{

            $(e.currentTarget).parent().parent().parent().children('.competencia_quien').addClass('hide');
            $(e.currentTarget).parent().parent().parent().children('.competencia_porque').addClass('hide');
        }

        if(valor=='4'){//No tenemos el producto que requiere
            $(e.currentTarget).parent().parent().parent().children('.que_producto').removeClass('hide');
        }else{
            $(e.currentTarget).parent().parent().parent().children('.que_producto').addClass('hide');
        }

        if(valor=='7'){//No se encuentra interesado
            $(e.currentTarget).parent().parent().parent().children('.no_interesado').removeClass('hide');
        }else{
            $(e.currentTarget).parent().parent().parent().children('.no_interesado').addClass('hide');
        }

    },

    onBeforeRender(){
        //Condición para saber si se debe mostrar el campo de No viable
        if(this.model.get('tipo_registro_c')=='Lead' && !this.context.get('create')){
            this.vista='block';
        }else{
            this.vista='none';
        }

    },

    onAfterRender(){
        //Obtener la info de cada usuario por producto para saber si se permite la edición al respectivo campo No viable
        var id_current_user=App.user.get('id');
        //Leasing
        if(id_current_user!=this.context.get('model').attributes.user_id_c){
            //Bloquear sección No viable Leasing
            $('#leasing').attr('style','pointer-events:none');
        }

        //Factoraje
        if(id_current_user!=this.context.get('model').attributes.user_id1_c){
            //Bloquear sección No viable Leasing
            $('#factoraje').attr('style','pointer-events:none');
        }

        //Crédito Automotriz
        if(id_current_user!=this.context.get('model').attributes.user_id2_c){
            //Bloquear sección No viable Leasing
            $('#credito').attr('style','pointer-events:none');
        }

        //Fleet
        if(id_current_user!=this.context.get('model').attributes.user_id6_c){
            //Bloquear sección No viable Leasing
            $('#fleet').attr('style','pointer-events:none');
        }

        //Uniclick
        if(id_current_user!=this.context.get('model').attributes.user_id7_c){
            //Bloquear sección No viable Leasing
            $('#uniclick').attr('style','pointer-events:none');
        }
    },
   
});

customization.register(NoViableField, { metadataType: 'no_viable' });

module.exports = NoViableField;