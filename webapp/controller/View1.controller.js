sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/core/util/Export",
    "sap/ui/core/util/ExportTypeCSV",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
],
    function (Controller, JSONModel, Filter, Export, ExportTypeCSV,MessageBox,Spreadsheet) {
        "use strict";

        return Controller.extend("com.app.calendartableview.controller.View1", {
            onInit: function () {
                var date = new Date();

                this.oModel = new JSONModel({
                    dDefaultDate: new Date(),
                    startDate: new Date(date.getFullYear(), date.getMonth(), 1),
                    endDate: new Date(date.getFullYear() + 10, date.getMonth(), 0)
                });
                this.getView().setModel(this.oModel, "view");

                var serviceurl = "/sap/opu/odata/sap/ZC_PM_GETPLANT_CDS/";
                var oModelF4 = new sap.ui.model.odata.ODataModel(serviceurl);
                var entity = "/ZC_PM_GETPLANT"
                var that = this;
                var date = this.getView().getModel("view").getData();
                this.firstday = date.startDate;
                this.lastday = date.endDate;
                oModelF4.read(entity, {
                    method: "GET",
                    success: function (oData) {
                        that.selectedPlant = oData.results[0].Plant;
                        var f4Model = new JSONModel([]);
                        f4Model.setData(oData.results);
                        that.getView().setModel(f4Model, "F4Data");
                        that.getdetails(that.firstday, that.lastday);
                    },
                    error: function (e) {
                     //   alert("error");
                    }
                })
            },
            getdetails: function (firstday, lastday) {
                var oModel1 = this.getOwnerComponent().getModel();
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-ddT00:00:00"
                });
                var dateFormat1 = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-ddT00:00:00"
                });
                var Filter1 = new Filter('Iwerk', 'EQ', this.selectedPlant);
                var Filter2 = new Filter('Nplda', 'BT', dateFormat.format(firstday),dateFormat1.format(lastday));
               // var Filter3 = new Filter('Nplda', 'LE', dateFormat1.format(lastday));
                var Filter4 = new Filter('Auart', 'EQ', "ZPLN");
    
                var ofilter = [Filter1, Filter2,Filter4];
                var entity = "/getCalibCalendarSet"
                var that = this;
                var busyDialog = new sap.m.BusyDialog();
                busyDialog.open();
                oModel1.read(entity, {
                    filters: ofilter,
                    "async": true,
                    "success": function (oData) {
                        const dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                            pattern: "d MMM y"
                        });
                        for (var i = 0; i < oData.results.length; i++) {
                            oData.results[i].Nplda = dateFormat.format(oData.results[i].Nplda);
                            oData.results[i].Lastcaldate = dateFormat.format(oData.results[i].Lastcaldate);
                        }
                        busyDialog.close();
                        that.calModel = new JSONModel([]);
                        that.calModel.setData(oData.results)
                        that.getView().setModel(that.calModel,"prevData");
                    },
                    "error": function (oError) {
                        busyDialog.close();
                    }
                });
            },

            handleChange : function(evt){
                this.firstday = evt.getSource().getDateValue();
                this.lastday = evt.getSource().getSecondDateValue();
                this.getdetails(this.firstday, this.lastday);
            },

            onChange: function (evt) {
                this.selectedPlant = evt.oSource.getSelectedKey();
                this.getdetails(this.firstday, this.lastday);
            },
            onExport: function() {
                var aCols, oSettings, oSheet;
               var data = this.getView().getModel("prevData").getData();
                aCols = this._createColumnConfig();
                var busyDialog = new sap.m.BusyDialog();
                oSettings = {
                    workbook: {
                        columns: aCols
                    },
                    dataSource: data,
                    fileName: "Preventive Maintenance Report",
                    sheetName: "Preventive Maintenance Report"
                };
                oSheet = new Spreadsheet(oSettings);
                oSheet.build()
                    .then(function () {
                        busyDialog.open();
                    })
                    .finally(oSheet.destroy);
                //this.uploadFilesModel.getData().orgStructurePercent = 17;
                //this.uploadFilesModel.refresh();
                setTimeout(function () {
                    busyDialog.close();
                }, 3000);
            },
     
            _createColumnConfig: function () {
                return [ {
                	label: "Mantenance Plan Name",
                	property: "Warpl",
                	//type: EdmType.String,
                	scale: 0
                },
                {
                	label: "Maintenance Plan Desc",
                	property: "Maintplandesc",
                	//type: EdmType.String,
                	scale: 0
                },
                    {
                    label: "Equipment Number",
                    property: "Equnr",
                    //type: EdmType.String,
                    scale: 0
                }, {
                    label: "Equipment Description",
                    property: "Equipmentdescription",
                    //type: EdmType.String,
                    scale: 0
                }, {
                    label: "Specification",
                    property: "Groes",
                    //type: EdmType.String,
                    scale: 0
                }, {
                    label: "Manufacturer",
                    property: "Herst",
                    //type: EdmType.String,
                    scale: 0
                },
                 {
                    label: "Model Number",
                    property: "Typbz",
                    //type: EdmType.String,
                    scale: 0
                },
                 {
                    label: "Functional Location",
                    property: "Tplnr",
                    //type: EdmType.String,
                    scale: 0
                },
                 {
                    label: "Equipment System Status",
                    property: "Equipsysat",
                    //type: EdmType.String,
                    scale: 0
                }, 
                  {
                    label: "Equipment User Status",
                    property: "EquipUstat",
                    //type: EdmType.String,
                    scale: 0
                }, 
                {
                    abel: "Last Maintenance Date",
                    property: "Lastcaldate",
                    //type: EdmType.String,
                    scale: 0
                 },
                {
                	label: "Maintainance Due Date",
                	property: "Nplda",
                	//type: EdmType.String,
                	scale: 0
                },
                {
                	label: "Maintenance Frequency",
                	property: "Frequency",
                	//type: EdmType.String,
                	scale: 0
                },
                {
                	label: "Order Number",
                	property: "Laufn",
                	//type: EdmType.String,
                	scale: 0
                },
                {
                	label: "Order Status",
                	property: "Longdesc",
                	//type: EdmType.String,
                	scale: 0
                }
               
            ];
            }
     
    
        });l
    });
