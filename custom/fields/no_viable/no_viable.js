const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const TextField = require('%app.fields%/text-field');
const dialog = require('%app.core%/dialog');
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

        this.model.addValidationTask('validateCamposNoViable', _.bind(this.validateCamposNoViable, this));
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

    validateCamposNoViable(fields, errors, callback){
        //Validación por producto
        var faltantesLeasing = 0;
        var faltantesFactoraje = 0;
        var faltantesCredito = 0;
        var faltantesFleet = 0;
        var faltantesUniclick=0;

        var mensajeLeasing='';
        var mensajeFactoraje='';
        var mensajeCredito='';
        var mensajeFleet='';
        var mensajeUniclick='';

        var valorLeasing=$('#checkbox_no_viable').attr('checked');
        var valorFactoraje=$('#checkbox_no_viable_factoraje').attr('checked');
        var valorCredito=$('#checkbox_no_viable_credito').attr('checked');
        var valorFleet=$('#checkbox_no_viable_factoraje').attr('checked');
        var valorUniclick=$('#checkbox_no_viable_uniclick').attr('checked');

        if(valorLeasing){
            var response=this.validaReqPorProducto('leasing');
            mensajeLeasing=response[0];
            faltantesLeasing=response[1];
        }

        if(valorFactoraje){
            var responseFactoraje=this.validaReqPorProducto('factoraje');
            mensajeFactoraje=responseFactoraje[0];
            faltantesFactoraje=responseFactoraje[1];
        }

        if(valorCredito){
            var responseCredito=this.validaReqPorProducto('credito');
            mensajeCredito=responseCredito[0];
            faltantesCredito=responseCredito[1];
        }

        if(valorFleet){
            var responseFleet=this.validaReqPorProducto('fleet');
            mensajeFleet=responseFleet[0];
            faltantesFleet=responseFleet[1];
        }

        if(valorUniclick){
            var responseUniclick=this.validaReqPorProducto('uniclick');
            mensajeUniclick=responseUniclick[0];
            faltantesUniclick=responseUniclick[1];
        }

        var faltantes=faltantesLeasing+faltantesFactoraje+faltantesCredito+faltantesFleet+faltantesUniclick;

        if (faltantes > 0) {
            dialog.showAlert(mensajeLeasing+mensajeFactoraje+mensajeCredito+mensajeFleet+mensajeUniclick);

            errors['error_no_viable'] = errors['error_no_viable'] || {};
            errors['error_no_viable'].required = true;
        }

        callback(null, fields, errors);

    },

    /*
    * @param String producto Tipo de producto
    * @return Array response Arreglo en donde la primera posición contiene el mensaje y la segunda el número de campos faltantes
    */
    validaReqPorProducto(producto){

        var mensaje='\nNo viable '+producto+': Hace falta llenar los siguientes campos:\n';
        var faltantes = 0;

        if($('#razon_nv_'+producto).is(":visible") && ($('#razon_nv_'+producto).val()=="" || $('#razon_nv_'+producto).val()=="0" )){
            $('#razon_nv_'+producto).parent().parent().addClass('error');
            mensaje+='Raz\u00F3n de Lead no viable\n';
            faltantes+=1;
        }

            //Fuera de Perfil
        if($('#fuera_perfil_razon_'+producto).is(":visible") && ($('#fuera_perfil_razon_'+producto).val()=="" || $('#fuera_perfil_razon_'+producto).val()=="0" )){
            $('#fuera_perfil_razon_'+producto).parent().parent().addClass('error');
            mensaje+='Fuera de Perfil (Raz\u00F3n)\n';
            faltantes+=1;
        }

        //Condiciones financieras
        if($('#cond_financieras_'+producto).is(":visible") && ($('#cond_financieras_'+producto).val()=="" || $('#cond_financieras_'+producto).val()=="0" )){
            $('#cond_financieras_'+producto).parent().parent().addClass('error');
            mensaje+='Condiciones Financieras\n';
            faltantes+=1;
        }

        //Quién
        if($('#competencia_quien_'+producto).is(":visible") && $('#competencia_quien_'+producto).val().trim()==""){
            $('#competencia_quien_'+producto).parent().parent().parent().addClass('error');
            mensaje+='¿Qui\u00E9n?\n';
            faltantes+=1;
        }

        //Por qué
        if($('#competencia_porque_'+producto).is(":visible") && $('#competencia_porque_'+producto).val().trim()==""){
            $('#competencia_porque_'+producto).parent().parent().parent().addClass('error');
            mensaje+='¿Por qu\u00E9?\n';
            faltantes+=1;
        }

            //Qué producto
        if($('#que_producto_'+producto).is(":visible") && ($('#que_producto_'+producto).val()=="" || $('#que_producto_'+producto).val()=="0" )){
            $('#que_producto_'+producto).parent().parent().addClass('error');
            mensaje+='¿Qu\u00E9 producto?\n';
            faltantes+=1;
        }

            //Razón No se encuentra interesado
        if($('#no_interesado_'+producto).is(":visible") && ($('#no_interesado_'+producto).val()=="" || $('#no_interesado_'+producto).val()=="0" )){
            $('#no_interesado_'+producto).parent().parent().addClass('error');
            mensaje+='No se encuentra interesado\n';
            faltantes+=1;
        }

        return [mensaje,faltantes];
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