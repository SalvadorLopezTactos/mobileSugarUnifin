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
        
        'change #que_producto_leasing': 'showEspecifiqueProducto',
        'change #que_producto_factoraje': 'showEspecifiqueProducto',
        'change #que_producto_credito': 'showEspecifiqueProducto',
        'change #que_producto_fleet': 'showEspecifiqueProducto',
        'change #que_producto_uniclick': 'showEspecifiqueProducto',

    },

    initialize(options) {

        this._super(options);
        this.successFlag=0;
        this.getListValuesNoViable();

        if(!this.context.get('create')){
            this.getProductsInfo();
            this.getTipoCuentaPorProducto();
        }
        //Inicializando arreglo de productos vacío
        this.initializeProducts();
        this.initializeProductsForModel();

        this.model.addValidationTask('validateCamposNoViable', _.bind(this.validateCamposNoViable, this));
        //Guarda los valores hacia el modulo UNI PRODUCTOS
        if(!this.context.get('create')){

            this.model.addValidationTask('GuardaUniProductos', _.bind(this.saveUniProductos, this));

        }
        
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

    initializeProducts(){
        this.productos={
            'leasing':{
                'no_viable':'',
                'razon_nv':'',
                'fuera_perfil_razon':'',
                'condicionesFinancieras':'',
                'competencia_quien':'',
                'competencia_porque':'',
                'que_producto':'',
                'razon_no_interesado':''
            },
            'factoring':{
                'no_viable':'',
                'razon_nv':'',
                'fuera_perfil_razon':'',
                'condicionesFinancieras':'',
                'competencia_quien':'',
                'competencia_porque':'',
                'que_producto':'',
                'razon_no_interesado':''
            },
            'credito':{
                'no_viable':'',
                'razon_nv':'',
                'fuera_perfil_razon':'',
                'condicionesFinancieras':'',
                'competencia_quien':'',
                'competencia_porque':'',
                'que_producto':'',
                'razon_no_interesado':''
            },
            'fleet':{
                'no_viable':'',
                'razon_nv':'',
                'fuera_perfil_razon':'',
                'condicionesFinancieras':'',
                'competencia_quien':'',
                'competencia_porque':'',
                'que_producto':'',
                'razon_no_interesado':''
            },
            'uniclick':{
                'no_viable':'',
                'razon_nv':'',
                'fuera_perfil_razon':'',
                'condicionesFinancieras':'',
                'competencia_quien':'',
                'competencia_porque':'',
                'que_producto':'',
                'razon_no_interesado':''
            }
        }

    },

    initializeProductsForModel(){

        this.tipoProducto = {
            'leasing': {
                'id': '',
                'no_viable': '',
                'no_viable_razon': '',
                'no_viable_razon_fp': '',
                'no_viable_quien': '',
                'no_viable_porque': '',
                'no_viable_producto': '',
                'no_viable_razon_cf': '',
                'no_viable_otro_c': '',
                'no_viable_razon_ni': '',
                'assigned_user_id': ''
            },
            'factoring': {
                'id': '',
                'no_viable': '',
                'no_viable_razon': '',
                'no_viable_razon_fp': '',
                'no_viable_quien': '',
                'no_viable_porque': '',
                'no_viable_producto': '',
                'no_viable_razon_cf': '',
                'no_viable_otro_c': '',
                'no_viable_razon_ni': '',
                'assigned_user_id': ''
            },
            'credito_auto': {
                'id': '',
                'no_viable': '',
                'no_viable_razon': '',
                'no_viable_razon_fp': '',
                'no_viable_quien': '',
                'no_viable_porque': '',
                'no_viable_producto': '',
                'no_viable_razon_cf': '',
                'no_viable_otro_c': '',
                'no_viable_razon_ni': '',
                'assigned_user_id': ''
            },
            'fleet': {
                'id': '',
                'no_viable': '',
                'no_viable_razon': '',
                'no_viable_razon_fp': '',
                'no_viable_quien': '',
                'no_viable_porque': '',
                'no_viable_producto': '',
                'no_viable_razon_cf': '',
                'no_viable_otro_c': '',
                'no_viable_razon_ni': '',
                'assigned_user_id': ''
            },
            'uniclick': {
                'id': '',
                'no_viable': '',
                'no_viable_razon': '',
                'no_viable_razon_fp': '',
                'no_viable_quien': '',
                'no_viable_porque': '',
                'no_viable_producto': '',
                'no_viable_razon_cf': '',
                'no_viable_otro_c': '',
                'no_viable_razon_ni': '',
                'assigned_user_id': ''
            }
        };

    },

    getTipoCuentaPorProducto(){

        selfTipos=this;
        app.alert.show('getInfoTipos', {
                level: 'process',
                messages: 'Cargando...'
        });

        var idC = this.model.get('id');
        var url = app.api.buildURL('tct02_Resumen/' + idC, null, null);
        if(idC != "" && idC != undefined){

            app.api.call('GET',url,null,{
                success: _.bind(function (data) {
                    selfTipos.tipos=data;
                }),
                complete: () => {
                    app.alert.dismiss('getInfoTipos');
                },

            });

        }

    },

    getProductsInfo(){
        selfProducts=this;
        app.alert.show('getInfoProducts', {
                level: 'process',
                messages: 'Cargando...'
            });
        app.api.call('GET', app.api.buildURL('Accounts/'+this.model.get("id")+'/link/accounts_uni_productos_1'), null, {
                success: _.bind(function (data) {
                    if (data) {
                        if(data.records.length>0){

                            for(var i=0;i<data.records.length;i++){
                                //Producto Leasing
                                if(data.records[i].tipo_producto=='1'){
                                    selfProducts.productos.leasing.no_viable=data.records[i].no_viable;
                                    selfProducts.productos.leasing.razon_nv=data.records[i].no_viable_razon;
                                    selfProducts.productos.leasing.fuera_perfil_razon=data.records[i].no_viable_razon_fp;
                                    selfProducts.productos.leasing.condicionesFinancieras=data.records[i].no_viable_razon_cf;
                                    selfProducts.productos.leasing.competencia_quien=data.records[i].no_viable_quien;
                                    selfProducts.productos.leasing.competencia_porque=data.records[i].no_viable_porque;
                                    selfProducts.productos.leasing.que_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.leasing.especifique_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.leasing.razon_no_interesado=data.records[i].no_viable_razon_ni;

                                    //Se establece arreglo que viaja en this.model.set
                                    selfProducts.tipoProducto.leasing.id=data.records[i].id;
                                    selfProducts.tipoProducto.leasing.no_viable=data.records[i].no_viable;
                                    selfProducts.tipoProducto.leasing.no_viable_razon=data.records[i].no_viable_razon;
                                    selfProducts.tipoProducto.leasing.no_viable_razon_fp=data.records[i].no_viable_razon_fp;
                                    selfProducts.tipoProducto.leasing.no_viable_quien=data.records[i].no_viable_quien;
                                    selfProducts.tipoProducto.leasing.no_viable_porque=data.records[i].no_viable_porque;
                                    selfProducts.tipoProducto.leasing.no_viable_producto=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.leasing.no_viable_razon_cf=data.records[i].no_viable_razon_cf;
                                    selfProducts.tipoProducto.leasing.no_viable_otro_c=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.leasing.no_viable_razon_ni=data.records[i].no_viable_razon_ni;
                                    selfProducts.tipoProducto.leasing.assigned_user_id=data.records[i].assigned_user_id;
                                }
                                //Producto Factoring
                                if(data.records[i].tipo_producto=='4'){
                                    selfProducts.productos.factoring.no_viable=data.records[i].no_viable;
                                    selfProducts.productos.factoring.razon_nv=data.records[i].no_viable_razon;
                                    selfProducts.productos.factoring.fuera_perfil_razon=data.records[i].no_viable_razon_fp;
                                    selfProducts.productos.factoring.condicionesFinancieras=data.records[i].no_viable_razon_cf;
                                    selfProducts.productos.factoring.competencia_quien=data.records[i].no_viable_quien;
                                    selfProducts.productos.factoring.competencia_porque=data.records[i].no_viable_porque;
                                    selfProducts.productos.factoring.que_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.factoring.especifique_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.factoring.razon_no_interesado=data.records[i].no_viable_razon_ni;

                                    //Se establece arreglo que viaja en this.model.set
                                    selfProducts.tipoProducto.factoring.id=data.records[i].id;
                                    selfProducts.tipoProducto.factoring.no_viable=data.records[i].no_viable;
                                    selfProducts.tipoProducto.factoring.no_viable_razon=data.records[i].no_viable_razon;
                                    selfProducts.tipoProducto.factoring.no_viable_razon_fp=data.records[i].no_viable_razon_fp;
                                    selfProducts.tipoProducto.factoring.no_viable_quien=data.records[i].no_viable_quien;
                                    selfProducts.tipoProducto.factoring.no_viable_porque=data.records[i].no_viable_porque;
                                    selfProducts.tipoProducto.factoring.no_viable_producto=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.factoring.no_viable_razon_cf=data.records[i].no_viable_razon_cf;
                                    selfProducts.tipoProducto.factoring.no_viable_otro_c=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.factoring.no_viable_razon_ni=data.records[i].no_viable_razon_ni;
                                    selfProducts.tipoProducto.factoring.assigned_user_id=data.records[i].assigned_user_id;

                                }
                                //Producto Crédito Automotriz
                                if(data.records[i].tipo_producto=='3'){
                                    selfProducts.productos.credito.no_viable=data.records[i].no_viable;
                                    selfProducts.productos.credito.razon_nv=data.records[i].no_viable_razon;
                                    selfProducts.productos.credito.fuera_perfil_razon=data.records[i].no_viable_razon_fp;
                                    selfProducts.productos.credito.condicionesFinancieras=data.records[i].no_viable_razon_cf;
                                    selfProducts.productos.credito.competencia_quien=data.records[i].no_viable_quien;
                                    selfProducts.productos.credito.competencia_porque=data.records[i].no_viable_porque;
                                    selfProducts.productos.credito.que_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.credito.especifique_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.credito.razon_no_interesado=data.records[i].no_viable_razon_ni;

                                    //Se establece arreglo que viaja en this.model.set
                                    selfProducts.tipoProducto.credito_auto.id=data.records[i].id;
                                    selfProducts.tipoProducto.credito_auto.no_viable=data.records[i].no_viable;
                                    selfProducts.tipoProducto.credito_auto.no_viable_razon=data.records[i].no_viable_razon;
                                    selfProducts.tipoProducto.credito_auto.no_viable_razon_fp=data.records[i].no_viable_razon_fp;
                                    selfProducts.tipoProducto.credito_auto.no_viable_quien=data.records[i].no_viable_quien;
                                    selfProducts.tipoProducto.credito_auto.no_viable_porque=data.records[i].no_viable_porque;
                                    selfProducts.tipoProducto.credito_auto.no_viable_producto=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.credito_auto.no_viable_razon_cf=data.records[i].no_viable_razon_cf;
                                    selfProducts.tipoProducto.credito_auto.no_viable_otro_c=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.credito_auto.no_viable_razon_ni=data.records[i].no_viable_razon_ni;
                                    selfProducts.tipoProducto.credito_auto.assigned_user_id=data.records[i].assigned_user_id;

                                }
                                //Producto Fleet
                                if(data.records[i].tipo_producto=='6'){
                                    selfProducts.productos.fleet.no_viable=data.records[i].no_viable;
                                    selfProducts.productos.fleet.razon_nv=data.records[i].no_viable_razon;
                                    selfProducts.productos.fleet.fuera_perfil_razon=data.records[i].no_viable_razon_fp;
                                    selfProducts.productos.fleet.condicionesFinancieras=data.records[i].no_viable_razon_cf;
                                    selfProducts.productos.fleet.competencia_quien=data.records[i].no_viable_quien;
                                    selfProducts.productos.fleet.competencia_porque=data.records[i].no_viable_porque;
                                    selfProducts.productos.fleet.que_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.fleet.especifique_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.fleet.razon_no_interesado=data.records[i].no_viable_razon_ni;

                                    //Se establece arreglo que viaja en this.model.set
                                    selfProducts.tipoProducto.fleet.id=data.records[i].id;
                                    selfProducts.tipoProducto.fleet.no_viable=data.records[i].no_viable;
                                    selfProducts.tipoProducto.fleet.no_viable_razon=data.records[i].no_viable_razon;
                                    selfProducts.tipoProducto.fleet.no_viable_razon_fp=data.records[i].no_viable_razon_fp;
                                    selfProducts.tipoProducto.fleet.no_viable_quien=data.records[i].no_viable_quien;
                                    selfProducts.tipoProducto.fleet.no_viable_porque=data.records[i].no_viable_porque;
                                    selfProducts.tipoProducto.fleet.no_viable_producto=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.fleet.no_viable_razon_cf=data.records[i].no_viable_razon_cf;
                                    selfProducts.tipoProducto.fleet.no_viable_otro_c=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.fleet.no_viable_razon_ni=data.records[i].no_viable_razon_ni;
                                    selfProducts.tipoProducto.fleet.assigned_user_id=data.records[i].assigned_user_id;

                                }
                                //Producto Uniclick
                                if(data.records[i].tipo_producto=='8'){
                                    selfProducts.productos.uniclick.no_viable=data.records[i].no_viable;
                                    selfProducts.productos.uniclick.razon_nv=data.records[i].no_viable_razon;
                                    selfProducts.productos.uniclick.fuera_perfil_razon=data.records[i].no_viable_razon_fp;
                                    selfProducts.productos.uniclick.condicionesFinancieras=data.records[i].no_viable_razon_cf;
                                    selfProducts.productos.uniclick.competencia_quien=data.records[i].no_viable_quien;
                                    selfProducts.productos.uniclick.competencia_porque=data.records[i].no_viable_porque;
                                    selfProducts.productos.uniclick.que_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.uniclick.especifique_producto=data.records[i].no_viable_producto;
                                    selfProducts.productos.uniclick.razon_no_interesado=data.records[i].no_viable_razon_ni;

                                    //Se establece arreglo que viaja en this.model.set
                                    selfProducts.tipoProducto.uniclick.id=data.records[i].id;
                                    selfProducts.tipoProducto.uniclick.no_viable=data.records[i].no_viable;
                                    selfProducts.tipoProducto.uniclick.no_viable_razon=data.records[i].no_viable_razon;
                                    selfProducts.tipoProducto.uniclick.no_viable_razon_fp=data.records[i].no_viable_razon_fp;
                                    selfProducts.tipoProducto.uniclick.no_viable_quien=data.records[i].no_viable_quien;
                                    selfProducts.tipoProducto.uniclick.no_viable_porque=data.records[i].no_viable_porque;
                                    selfProducts.tipoProducto.uniclick.no_viable_producto=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.uniclick.no_viable_razon_cf=data.records[i].no_viable_razon_cf;
                                    selfProducts.tipoProducto.uniclick.no_viable_otro_c=data.records[i].no_viable_producto;
                                    selfProducts.tipoProducto.uniclick.no_viable_razon_ni=data.records[i].no_viable_razon_ni;
                                    selfProducts.tipoProducto.uniclick.assigned_user_id=data.records[i].assigned_user_id;

                                }
                            }

                            selfProducts.successFlag=1;

                            selfProducts.render();

                        }
                    }
                }, selfProducts),
                
                complete: () => {
                        app.alert.dismiss('getInfoProducts');
                    },
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

    saveUniProductos(fields, errors, callback){

        if (this.model.get('id') != "" && this.model.get('id') != undefined && Object.entries(errors).length == 0) {
            //Inicializando objeto de Leasing
            if ($('#checkbox_no_viable').attr('checked')) {
                var objLeasing = {
                    'id': this.tipoProducto.leasing.id, //Id
                    'no_viable': $('#checkbox_no_viable').attr('checked'),
                    'no_viable_razon': $('#razon_nv_leasing').val(), //lista Razón de Lead no viable 
                    'no_viable_razon_fp': $('#fuera_perfil_razon_leasing').val(), //lista Fuera de Perfil (Razón) 
                    'no_viable_quien': $('#competencia_quien_leasing').val(), //texto ¿Quién? 
                    'no_viable_porque': $('#competencia_porque_leasing').val(), //texto ¿Por qué? 
                    'no_viable_producto': $('#que_producto_leasing').val(), //lista ¿Qué producto? 
                    'no_viable_razon_cf': $('#cond_financieras_leasing').val(), //lista Condiciones Financieras 
                    'no_viable_otro_c': $('#especifique_producto_leasing').val(), //texto ¿Qué producto? 
                    'no_viable_razon_ni': $('#no_interesado_leasing').val(), //lista Razón No se encuentra interesado 
                    'assigned_user_id': this.tipoProducto.leasing.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                };

                this.tipoProducto.leasing = objLeasing;
            }

            //Inicializando objeto de Factoraje
            if ($('#checkbox_no_viable_factoraje').attr('checked')) {
                var objFactoring = {
                    'id': this.tipoProducto.factoring.id, //Id
                    'no_viable': $('#checkbox_no_viable_factoraje').attr('checked'),
                    'no_viable_razon': $('#razon_nv_factoraje').val(), //lista Razón de Lead no viable 
                    'no_viable_razon_fp': $('#fuera_perfil_razon_factoraje').val(), //lista Fuera de Perfil (Razón) 
                    'no_viable_quien': $('#competencia_quien_factoraje').val(), //texto ¿Quién? 
                    'no_viable_porque': $('#competencia_porque_factoraje').val(), //texto ¿Por qué? 
                    'no_viable_producto': $('#que_producto_factoraje').val(), //lista ¿Qué producto? 
                    'no_viable_razon_cf': $('#cond_financieras_factoraje').val(), //lista Condiciones Financieras
                    'no_viable_otro_c': $('#especifique_producto_factoraje').val(), //texto ¿Qué producto?
                    'no_viable_razon_ni': $('#no_interesado_factoraje').val(), //lista Razón No se encuentra interesado
                    'assigned_user_id': this.tipoProducto.factoring.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                };

                this.tipoProducto.factoring = objFactoring;
            }

            //Inicializando objeto de Crédito
            if ($('#checkbox_no_viable_credito').attr('checked')) {
                var objCredito = {
                    'id': this.tipoProducto.credito_auto.id, //Id 
                    'no_viable': $('#checkbox_no_viable_credito').attr('checked'),
                    'no_viable_razon': $('#razon_nv_credito').val(), //lista Razón de Lead no viable 
                    'no_viable_razon_fp': $('#fuera_perfil_razon_credito').val(), //lista Fuera de Perfil (Razón) 
                    'no_viable_quien': $('#competencia_quien_credito').val(), //texto ¿Quién? 
                    'no_viable_porque': $('#competencia_porque_credito').val(), //texto ¿Por qué? 
                    'no_viable_producto': $('#que_producto_credito').val(), //lista ¿Qué producto? 
                    'no_viable_razon_cf': $('#cond_financieras_credito').val(), //lista Condiciones Financieras 
                    'no_viable_otro_c': $('#especifique_producto_credito').val(), //texto ¿Qué producto? 
                    'no_viable_razon_ni': $('#no_interesado_credito').val(), //lista Razón No se encuentra interesado 
                    'assigned_user_id': this.tipoProducto.credito_auto.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                };

                this.tipoProducto.credito_auto = objCredito;
            }

            //Inicializando objeto de Fleet
            if ($('#checkbox_no_viable_fleet').attr('checked')) {
                var objFleet = {
                    'id': this.tipoProducto.fleet.id, //Id 
                    'no_viable': $('#checkbox_no_viable_fleet').attr('checked'),
                    'no_viable_razon': $('#razon_nv_fleet').val(), //lista Razón de Lead no viable 
                    'no_viable_razon_fp': $('#fuera_perfil_razon_fleet').val(), //lista Fuera de Perfil (Razón) 
                    'no_viable_quien': $('#competencia_quien_fleet').val(), //texto ¿Quién? 
                    'no_viable_porque': $('#competencia_porque_fleet').val(), //texto ¿Por qué? 
                    'no_viable_producto': $('#que_producto_fleet').val(), //lista ¿Qué producto? 
                    'no_viable_razon_cf': $('#cond_financieras_fleet').val(), //lista Condiciones Financieras 
                    'no_viable_otro_c': $('#especifique_producto_fleet').val(), //texto ¿Qué producto? 
                    'no_viable_razon_ni': $('#no_interesado_fleet').val(), //lista Razón No se encuentra interesado 
                    'assigned_user_id': this.tipoProducto.fleet.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                };

                this.tipoProducto.fleet = objFleet;
            }

            //Inicializando objeto de Uniclick
            if ($('#checkbox_no_viable_uniclick').attr('checked')) {
                var objUniclick = {
                    'id': this.tipoProducto.uniclick.id, //Id 
                    'no_viable': $('#checkbox_no_viable_uniclick').attr('checked'),
                    'no_viable_razon': $('#razon_nv_uniclick').val(), //lista Razón de Lead no viable 
                    'no_viable_razon_fp': $('#fuera_perfil_razon_uniclick').val(), //lista Fuera de Perfil (Razón) 
                    'no_viable_quien': $('#competencia_quien_uniclick').val(), //texto ¿Quién? 
                    'no_viable_porque': $('#competencia_porque_uniclick').val(), //texto ¿Por qué? 
                    'no_viable_producto': $('#que_producto_uniclick').val(), //lista ¿Qué producto? 
                    'no_viable_razon_cf': $('#cond_financieras_uniclick').val(), //lista Condiciones Financieras 
                    'no_viable_otro_c': $('#especifique_producto_uniclick').val(), //texto ¿Qué producto? 
                    'no_viable_razon_ni': $('#no_interesado_uniclick').val(), //lista Razón No se encuentra interesado 
                    'assigned_user_id': this.tipoProducto.uniclick.assigned_user_id // Asigna a usuario '9 - No Viable' en Uni_Productos
                };

                this.tipoProducto.uniclick = objUniclick;
            }

            errors['error_no_viable'] = errors['error_no_viable'] || {};
            errors['error_no_viable'].required = true;

            //Establece el objeto para guardar
            //this.model.set('account_uni_productos', this.tipoProducto);

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

    showEspecifiqueProducto(e){

        var valor=$(e.currentTarget).val();
        if(valor=='4'){
             $(e.currentTarget).parent().parent().next().removeClass('hide');
        }else{
            $(e.currentTarget).parent().parent().next().addClass('hide');
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

        if(this.successFlag==1){
            //Se establecen valores de cada campo select con jquery ya que se debe de establecer un helper hbs para mobile
            //similar a la definición web custom/JavaScript/selectedOption-handlebar-helpers.js
            //Campos Leasing
            $('#razon_nv_leasing').val(this.productos.leasing.razon_nv);
            $('#fuera_perfil_razon_leasing').val(this.productos.leasing.fuera_perfil_razon);
            $('#cond_financieras_leasing').val(this.productos.leasing.condicionesFinancieras);
            $('#que_producto_leasing').val(this.productos.leasing.que_producto);
            $('#no_interesado_leasing').val(this.productos.leasing.razon_no_interesado);

            //Campos Factoraje
            $('#razon_nv_factoraje').val(this.productos.factoring.razon_nv);
            $('#fuera_perfil_razon_factoraje').val(this.productos.factoring.fuera_perfil_razon);
            $('#cond_financieras_factoraje').val(this.productos.factoring.condicionesFinancieras);
            $('#que_producto_factoraje').val(this.productos.factoring.que_producto);
            $('#no_interesado_factoraje').val(this.productos.factoring.razon_no_interesado);

            //Campos Crédito Automotriz
            $('#razon_nv_credito').val(this.productos.credito.razon_nv);
            $('#fuera_perfil_razon_credito').val(this.productos.credito.fuera_perfil_razon);
            $('#cond_financieras_credito').val(this.productos.credito.condicionesFinancieras);
            $('#que_producto_credito').val(this.productos.credito.que_producto);
            $('#no_interesado_credito').val(this.productos.credito.razon_no_interesado);

            //Campos Fleet
            $('#razon_nv_fleet').val(this.productos.fleet.razon_nv);
            $('#fuera_perfil_razon_fleet').val(this.productos.fleet.fuera_perfil_razon);
            $('#cond_financieras_fleet').val(this.productos.fleet.condicionesFinancieras);
            $('#que_producto_fleet').val(this.productos.fleet.que_producto);
            $('#no_interesado_fleet').val(this.productos.fleet.razon_no_interesado);

            //Campos Uniclick
            $('#razon_nv_uniclick').val(this.productos.uniclick.razon_nv);
            $('#fuera_perfil_razon_uniclick').val(this.productos.uniclick.fuera_perfil_razon);
            $('#cond_financieras_uniclick').val(this.productos.uniclick.condicionesFinancieras);
            $('#que_producto_uniclick').val(this.productos.uniclick.que_producto);
            $('#no_interesado_uniclick').val(this.productos.uniclick.razon_no_interesado);

            //Se disparan manualmente los eventos change de cada campo check para mostrar campos dependientes
            $('#checkbox_no_viable').trigger('change');
            $('#checkbox_no_viable_factoraje').trigger('change');
            $('#checkbox_no_viable_credito').trigger('change');
            $('#checkbox_no_viable_fleet').trigger('change');
            $('#checkbox_no_viable_uniclick').trigger('change');

            $('#razon_nv_leasing').trigger('change');
            $('#razon_nv_factoraje').trigger('change');
            $('#razon_nv_credito').trigger('change');
            $('#razon_nv_fleet').trigger('change');
            $('#razon_nv_uniclick').trigger('change');

            //Se dispara evento change para mostrar campo de "Especifique producto"
            $('#que_producto_leasing').trigger('change');
            $('#que_producto_factoraje').trigger('change');
            $('#que_producto_credito').trigger('change');
            $('#que_producto_fleet').trigger('change');
            $('#que_producto_fleet').trigger('change');

            //Validaciones para ocultar las secciones de los productos que no están en productos:
            // LEAD, PROSPECTO CONTACTADO O PROSPECTO INTERESADO
            if(this.tipos){
                //Validando si se debe mostrar sección de Leasing
                if(this.tipos.tct_tipo_cuenta_l_c != 'LEAD EN CALIFICACIÓN' && this.tipos.tct_tipo_cuenta_l_c != 'PROSPECTO CONTACTADO' && this.tipos.tct_tipo_cuenta_l_c != 'PROSPECTO INTERESADO'){
                    $('#leasing').addClass('hide');
                }

                //Validando si se debe mostrar sección de Factoraje
                if(this.tipos.tct_tipo_cuenta_f_c != 'LEAD EN CALIFICACIÓN' && this.tipos.tct_tipo_cuenta_f_c != 'PROSPECTO CONTACTADO' && this.tipos.tct_tipo_cuenta_f_c != 'PROSPECTO INTERESADO'){
                    $('#factoraje').addClass('hide');
                }

                //Validando si se debe mostrar sección de Crédito
                if(this.tipos.tct_tipo_cuenta_ca_c != 'LEAD EN CALIFICACIÓN' && this.tipos.tct_tipo_cuenta_ca_c != 'PROSPECTO CONTACTADO' && this.tipos.tct_tipo_cuenta_ca_c != 'PROSPECTO INTERESADO'){
                    $('#credito').addClass('hide');
                }

                //Validando si se debe mostrar sección de Fleet
                if(this.tipos.tct_tipo_cuenta_fl_c != 'LEAD EN CALIFICACIÓN' && this.tipos.tct_tipo_cuenta_fl_c != 'PROSPECTO CONTACTADO' && this.tipos.tct_tipo_cuenta_fl_c != 'PROSPECTO INTERESADO'){
                    $('#fleet').addClass('hide');
                }

                //Validando si se debe mostrar sección de Uniclick
                if(this.tipos.tct_tipo_cuenta_uc_c != 'LEAD EN CALIFICACIÓN' && this.tipos.tct_tipo_cuenta_uc_c != 'PROSPECTO CONTACTADO' && this.tipos.tct_tipo_cuenta_uc_c != 'PROSPECTO INTERESADO'){
                    $('#uniclick').addClass('hide');
                }

            }

        }
    },
   
});

customization.register(NoViableField, { metadataType: 'no_viable' });

module.exports = NoViableField;