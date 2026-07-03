<template>

  <!-- <q-form @submit.prevent="subirArchivo">    
      <div class="q-pa-sm row items-center q-gutter-sm">
   
      <q-input
        filled
        dense
        v-model="nombreArchivo"
        readonly
        label="Seleccionar archivo"
        style="flex: 1;"
      >
        <template v-slot:append>
          <q-btn 
            flat 
            icon="attach_file" 
            @click="abrirSelector" 
          />
        </template>
      </q-input>

     
      <q-btn
        color="primary"
        label="Subir"
        type="submit"
        :disable="!archivo"
      />
    </div>

   
    <input 
      ref="fileInput" 
      type="file" 
      class="hidden" 
      @change="seleccionarArchivo" 
    />
  </q-form> -->

     <div class="q-pa-sm row items-center q-gutter-sm">
 <q-field
		:label="nombreLabel"
		dense
		outlined
		readonly
		stack-label
		class="borde-normal"
		style="min-width: 350px;" 
		>
            <template v-slot:control>
                <span class="text-green-9 text-bold" v-show="archivoAdjunto">ARCHIVO CARGADO</span>
            </template>

            <template v-slot:append>
                <q-icon name="cancel" class="text-red cursor-pointer" @click="limpiar" v-show="model">
                <q-tooltip>REMOVER ARCHIVO</q-tooltip>
                </q-icon>

                <q-icon name="attach_file" class="text-blue cursor-pointer" @click="eventoOpcAdjuntarArchivo">
                <q-tooltip>ADJUNTAR ARCHIVO</q-tooltip>
                </q-icon>

                <q-icon name="picture_as_pdf" class="text-blue cursor-pointer" @click="verArchivo" v-show="archivoAdjunto">
                <q-tooltip>VER ARCHIVO</q-tooltip>
                </q-icon>

                
            </template>

        </q-field> 

        <q-file style="display: none;" ref="refArchivoAdjunto" v-model="model"   accept="application/pdf, image/*" ></q-file>

        <q-btn
            v-if="model"
            dense
            class="text-blue cursor-pointer"
            label=""
            icon="upload"
            @click="subirArchivo"
            style="background-color: white"
        />

    </div>

</template>

<script>
export default {
  name: "UploaderArchivo",
  props:{
    data: {
        type: Object,
        default: () => ({})
    },
    tipoAnexo:{
      type: [String, Number],
      required: true
    },
    numAnexo:{
      type: [String, Number],
      required: false
    }
  },
  mounted(){   
    this.nombreLabel = this.numAnexo == 12? "Informe de Egreso (*)" : "Documento Adjunto (*)";
    
    this.cargarArchivo();
  },
  data() {
    return {
      host: process.env.API_URL,
      requestConfig: { headers: {'Content-type': 'application/json'} },
      requestMultipartConfig: { headers: { 'Content-Type': 'multipart/form-data'} },

      archivo: null,
      nombreArchivo: "",
      model: null,
      archivoAdjunto:  null,

      nombreLabel: null
    };
  },
  methods: {
     mostrarMensaje: function (mensaje, color, icono) {
            this.$q.notify({message: mensaje, color: color, icon: icono, position: 'top-right'});
    },
    async cargarArchivo() {
        try {    
                   
                const response = await this.$axios.post(`${this.host}/obtenerArchivosAdjuntos`, {
                    
                 
                    idServicio: this.data.idServicio,
                    idFamilia: this.data.idFamilia,
                    anexo: this.numAnexo,
                    fase : this.data.fase
                    
                });                    
                
                const data = response.data.data[0];            

                this.archivoAdjunto = data.respuesta;              
                 
                    
            } catch (error) {
                //this.mostrarMensaje('NO SE ENCONTRÓ ARCHIVO ADJUNTO', 'red', 'warning');
                return null;
            }
    },  
    abrirSelector() {
      this.$refs.fileInput.click();
    },
    seleccionarArchivo(e) {
      const file = e.target.files[0];
      if (file) {
        this.archivo = file;
        this.nombreArchivo = file.name;
      }
    },
    async subirArchivo2() {
      if (!this.archivo) return;

      const formData = new FormData();
      formData.append("archivo", this.archivo);

       const saveUploader = {
        idServicio: this.data.idServicio,
        idZona: this.data.idZona,
        idFamilia: this.data.idFamilia,
        tipoAnexo: this.tipoAnexo,
        anexo:this.numAnexo,
        fase: this.data.fase,
        idUsuario: this.$q.localStorage.getItem('mda-idUsuario')
      };

      formData.append('data', JSON.stringify(saveUploader));

      try {
        // aquí mandas al backend
        this.$axios.post(`${this.host}/subirAnexos`, formData)
          .then(response => {
             this.$emit('cerrar');    
            this.mostrarMensaje('DATOS GUARDADOS CORRECTAMENTE', 'green', 'check_circle');         


          })
          .catch(error => {     
            this.mostrarMensaje('ERROR AL GUARDAR DATOS', 'red', 'error');
          });

        this.$emit('cerrar');  
        this.$q.notify({
          type: "positive",
          message: "Archivo subido correctamente"
        });

        this.archivo = null;
        this.nombreArchivo = "";
      } catch (error) {
        this.$q.notify({
          type: "negative",
          message: "Error al subir el archivo"
        });
      }
    },
    limpiar() {   
        this.model = null;
        this.idRespuestaActual = null;
        //this.archivoAdjunto = null;
    },
    eventoOpcAdjuntarArchivo: function () {
            this.$refs.refArchivoAdjunto.pickFiles();
    },
    async subirArchivo() {
      
            if (!this.model) return;        

            try {                 
                  const formData = new FormData();
                  formData.append("archivo", this.model);

                  const saveUploader = {
                    idServicio: this.data.idServicio,
                    idZona: this.data.idZona,
                    idFamilia: this.data.idFamilia,
                    tipoAnexo: this.tipoAnexo,
                    anexo:this.numAnexo,
                    fase: this.data.fase,
                    idUsuario: this.$q.localStorage.getItem('mda-idUsuario')
                  };

                  formData.append('data', JSON.stringify(saveUploader));           
                 
                    // aquí mandas al backend
                    this.$axios.post(`${this.host}/subirAnexos`, formData)
                      .then(response => {
                        this.$emit('cerrar');    
                        //this.obtenerPreguntasCuestionarioAnexo1Cuestionario3();
                        this.mostrarMensaje('ARCHIVO SUBIDO EXITOSAMENTE', 'green', 'check_circle');   
                       // this.archivoAdjunto = this.tipoAnexo + '_' + this.model.name;      
                      this.model = null;
                      this.cargarArchivo();

                      })
                      .catch(error => {     
                        this.mostrarMensaje('ERROR AL GUARDAR DATOS', 'red', 'error');
                      });                 
                
            } catch (error) {
                this.$q.notify({
                    type: "negative",
                    message: "Error al subir el archivo"
                });
            }
    },
      async verArchivo() {
            try {
                if (!this.archivoAdjunto) return;
                var response = [];
                const nombreArchivo = this.archivoAdjunto; 
                window.open(`${this.host}/adjuntos/${nombreArchivo}`, '_blank');                
              

                // const blob = new Blob([response.data], { type: "application/pdf" });
                // const url = URL.createObjectURL(blob);
                // window.open(url, "_blank");
                // URL.revokeObjectURL(url);
            } catch (error) {
                this.$q.notify({
                    type: "negative",
                    message: "Error al visualizar el archivo"
                });
            }
    },


  }
};
</script>
