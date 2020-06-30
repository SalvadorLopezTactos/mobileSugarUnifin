const app = SUGAR.App;
const customization = require('%app.core%/customization.js');
const TextField = require('%app.fields%/text-field');
const dialog = require('%app.core%/dialog');
const CanalUniclickField = customization.extend(TextField, {

    initialize(options) {

        this._super(options);
        this.getListValuesCanal();

    },

    getListValuesCanal(){
        window.canal_uniclick="";
        var selfList=this;
        app.alert.show('getlistaCanal', {
                level: 'load',
                closeable: false,
                messages: app.lang.get('LBL_LOADING'),
            });
        app.api.call('GET', app.api.buildURL('GetDropdownList/canal_list'), null, {
                success: _.bind(function (data) {
                    if (data) {
                        delete data[""];
                        selfList.lista_canal=data;  
                    }
                    app.alert.dismiss('getlistaCanal');
                    selfList.render();
                    if(window.canal_uniclick != undefined){
                        $(".canalUniclick").val(window.canal_uniclick);
                    }
                    
                }, selfList),
            });

    },
   
});

customization.register(CanalUniclickField, { metadataType: 'canal_uniclick_mobile' });

module.exports = CanalUniclickField;