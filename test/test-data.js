
module.exports.routes =
`
import projectRoutes from './projectRoutes'
import researcherRoutes from './researcherRoutes'
import specieRoutes from './specieRoutes'

let child_paths = []

      child_paths.push(...projectRoutes)
      child_paths.push(...researcherRoutes)
      child_paths.push(...specieRoutes)

export default child_paths
`

module.exports.sideNav =
`
<template>
  <div class="sidenav">
    <a href="/home"> HOME </a>
        <a href='/projects'> projects   </a>
        <a href='/researchers'> researchers   </a>
        <a href='/species'> species   </a>
      </div>
</template>

<script>

export default {
  name: 'side-nav'
}
</script>

<style>
.sidenav {
    text-align: left;
    height: 100%;
    width: 280px;
    position: fixed;
    z-index: 1;
    top: 0;
    left: 0;
    background-color: #111;
    overflow-x: hidden;
    padding-top: 20px;
}
.sidenav a {
    padding: 6px 6px 6px 32px;
    text-decoration: none;
    color: #818181;
    display: block;
}
.sidenav a:hover {
    color: #f1f1f1;
}

@media screen and (max-height: 450px) {
  .sidenav {padding-top: 15px;}
  .sidenav a {font-size: 18px;}
}
</style>
`

module.exports.modelsObj =
{ models:
  [ { name: 'project',
      nameLc: 'project',
      namePl: 'projects',
      namePlLc: 'projects' },
    { name: 'researcher',
      nameLc: 'researcher',
      namePl: 'researchers',
      namePlLc: 'researchers' },
    { name: 'specie',
      nameLc: 'specie',
      namePl: 'species',
      namePlLc: 'species' } ] }

module.exports.book_table = `
<template>
  <div class="ui container">
    <filter-bar></filter-bar>
    <div class="inline field pull-left">
      <router-link v-bind:to="'book'"><button class="ui primary button">Add book</button></router-link>
      <button class="ui primary button" @click="downloadExampleCsv">CSV Example Table</button>
      <router-link v-bind:to="'/books/upload_csv'"><button class="ui primary button">CSV Upload</button></router-link>
    </div>
    <vuetable ref="vuetable"
      :api-url="this.$baseUrl()"
      :fields="fields"
      :per-page="20"
      :appendParams="moreParams"
      :http-options="{ headers: {Authorization: \`bearer \${this.$getAuthToken()}\`} }"
      pagination-path="data.vueTableBook"
      detail-row-component="book-detail-row"
      data-path="data.vueTableBook.data"
      @vuetable:pagination-data="onPaginationData"
      @vuetable:cell-clicked="onCellClicked"
      @vuetable:load-error="onError"
    ></vuetable>
    <div class="vuetable-pagination ui basic segment grid">
      <vuetable-pagination-info ref="paginationInfo"
      ></vuetable-pagination-info>
      <vuetable-pagination ref="pagination"
        @vuetable-pagination:change-page="onChangePage"
      ></vuetable-pagination>
    </div>
  </div>
</template>

<script>
import Vuetable from 'vuetable-2/src/components/Vuetable.vue'
import VuetablePagination from 'vuetable-2/src/components/VuetablePagination.vue'
import VuetablePaginationInfo from 'vuetable-2/src/components/VuetablePaginationInfo.vue'
import BookCustomActions from './BookCustomActions.vue'
import BookDetailRow from './BookDetailRow.vue'
import FilterBar from './FilterBar.vue'

import axios from 'axios'

import Vue from 'vue'
import VueEvents from 'vue-events'
Vue.use(VueEvents)

Vue.component('book-custom-actions', BookCustomActions)
Vue.component('book-detail-row', BookDetailRow)
Vue.component('filter-bar', FilterBar)

export default {
  components: {
    Vuetable,
    VuetablePagination,
    VuetablePaginationInfo,
    BookDetailRow
  },
  data() {
    return {
      fields: [{
          name: 'id',
          title: 'ID',
          titleClass: 'center aligned',
          dataClass: 'right aligned'
        },
        // For now, we do not render checkboxes, as we yet have to provide
        // functions for selected rows.
        //{
        //  name: '__checkbox',
        //  titleClass: 'center aligned',
        //  dataClass: 'center aligned'
        //},
                  {
            name: 'title',
            sortField: 'title'
          },
                  {
            name: 'genre',
            sortField: 'genre'
          },
                {
          name: '__component:book-custom-actions',
          title: 'Actions',
          titleClass: 'center aligned',
          dataClass: 'center aligned'
        }
      ],
      moreParams: {
        query: "{vueTableBook{data {id title genre}total per_page current_page last_page prev_page_url next_page_url from to}}"
      }
    }
  },
  methods: {
    onPaginationData(paginationData) {
      this.$refs.pagination.setPaginationData(paginationData)
      this.$refs.paginationInfo.setPaginationData(paginationData)
    },
    onChangePage(page) {
      this.$refs.vuetable.changePage(page)
    },
    onCellClicked(data, field, event) {
      console.log('cellClicked: ', field.name)
      this.$refs.vuetable.toggleDetailRow(data.id)
    },
    onFilterSet(filterText) {
      this.moreParams [
        'filter']= filterText.trim()
      Vue.nextTick(() => this.$refs.vuetable.refresh())
    },
    onFilterReset() {
      this.moreParams = {
        query: "{vueTableBook{data {id title genre}total per_page current_page last_page prev_page_url next_page_url from to}}"
      }
      Vue.nextTick(() => this.$refs.vuetable.refresh())
    },
    onDelete () {
      if (window.confirm("Do you really want to delete books of ids '" + this.$refs.vuetable.selectedTo.join("; ") + "'?")) {
        var t = this;
        var url = this.$baseUrl()() + '/book/' + this.$refs.vuetable.selectedTo.join("/")
        axios.delete(url, {
          headers: {
            'authorization': \`Bearer \${t.$getAuthToken()}\`,
            'Accept': 'application/json'
          }
        }).then(function (response) {
          t.$refs.vuetable.refresh()
        }).catch(function (error) {
          t.error = error
        })
      }
    },
    onCsvExport () {
      var t = this;
      var url = this.$baseUrl()() + '/books/example_csv' + '?array=[' + this.$refs.vuetable.selectedTo.join(",") + ']'

      axios.get(url, {
        headers: {
          'authorization': \`Bearer \${t.$getAuthToken()}\`,
          'Accept': 'application/json'
        }
      }).then(function (response) {

        var a = document.createElement("a");
        document.body.appendChild(a);
        a.style = "display: none";
        var blob = new Blob([response.data], {type: "octet/stream"});
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = 'book' + '.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }).catch(function (error) {
        t.error = error
      })
    },
    downloadExampleCsv: function() {
      var t = this
      axios.get(t.$baseUrl() + '/books/example_csv', {
        headers: {
          'authorization': \`Bearer \${t.$getAuthToken()}\`,
          'Accept': 'application/json'
        },
        responseType: 'blob'
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'books.csv');
        document.body.appendChild(link);
        link.click();
      }).catch(res => {
        var err = (res && res.response && res.response.data && res.response
          .data.message ?
          res.response.data.message : res)
        t.$root.$emit('globalError', err)
        t.$router.push('/')
      })
    },
    onError: function(res) {
      var err = (res && res.response && res.response.data && res.response.data.message ?
        res.response.data.message : res)
      this.$root.$emit('globalError', err)
      this.$router.push('/')
    }
  },
  mounted() {
    this.$events.$on('filter-set', eventData => this.onFilterSet(eventData))
    this.$events.$on('filter-reset', e => this.onFilterReset())
  }
}
</script>

`

module.exports.DogFormElem = `
<template>
  <div id="dog-form-elemns-div">

  <input type="hidden" v-model="dog.id"/>


    <div id="dog-name-div" class="form-group">
            <label>name</label>

  <input type="text" v-model="dog.name" class="form-control"/>


      <div id="dog-name-err" v-if="validationError('name')" class="alert alert-danger">
        {{validationError('name').message}}
      </div>
    </div>


    <div id="dog-breed-div" class="form-group">
            <label>breed</label>

  <input type="text" v-model="dog.breed" class="form-control"/>


      <div id="dog-breed-err" v-if="validationError('breed')" class="alert alert-danger">
        {{validationError('breed').message}}
      </div>
    </div>



    <div id="dog-person-div" class="form-group">
      <label>person</label>
      <foreign-key-form-element
        :searchUrl = "this.$baseUrl()"
        v-model:foreignKey="dog.personId"
        label="firstName"
        valueKey="id"
        query="{people{id firstName }}"
        queryName="people"
        v-bind:initialInput="personInitialLabel">
      </foreign-key-form-element>
    </div>


    <div id="dog-researcher-div" class="form-group">
      <label>researcher</label>
      <foreign-key-form-element
        :searchUrl = "this.$baseUrl()"
        v-model:foreignKey="dog.researcherId"
        label="firstName"
        valueKey="id"
        query="{researchers {id firstName }}"
        queryName="researchers"
        v-bind:initialInput="researcherInitialLabel">
      </foreign-key-form-element>
    </div>

  </div>
</template>

<script>
import Vue from 'vue'

import foreignKeyFormElement from './foreignKeyFormElement.vue'

Vue.component('foreign-key-form-element', foreignKeyFormElement)


export default {

  props: [ 'dog', 'errors' ],
  computed: {
          personInitialLabel: function () {
      var x = this.dog.person
      if (x !== null && typeof x === 'object' &&
          x['firstName'] !== null &&
          typeof x['firstName'] !== 'undefined') {
        return x['firstName']
      } else {
        return ''
      }
    }
        ,
              researcherInitialLabel: function () {
      var x = this.dog.researcher
      if (x !== null && typeof x === 'object' &&
          x['firstName'] !== null &&
          typeof x['firstName'] !== 'undefined') {
        return x['firstName']
      } else {
        return ''
      }
    }
        },
  methods: {
    validationError(modelField) {
      if (this.errors == null) return false;
      return this.errors.find(function (el) {
        return el.path === modelField
      })
    }
  },
	mounted: function() {
    let el = this;
    $(document).ready(function(){
      $('.datepicker').datepicker({
        format: el.$defaultDateFormat(),
        dateFormat: el.$defaultDateFormat()
      })
    })
	}
}
</script>
`
module.exports.DogCreateForm = `
<template>
  <div class="col-xs-5">
    <h4>New dog</h4>
    <div id="dog-div">
      <div v-if="dog" class="content">
        <form id="dog-form" v-on:submit.prevent="onSubmit">

          <dog-form-elemns v-bind:errors="errors" v-bind:dog="dog"></dog-form-elemns>

          <button type="submit" class="btn btn-primary">Create</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
import DogFormElemns from './DogFormElemns.vue'
import queries from '../requests/dog'

Vue.component('dog-form-elemns', DogFormElemns)

export default {
  data() {
    return {
      loading: false,
      dog: {},
      error: null,
      errors: null,
    }
  },
  methods: {
    onSubmit() {
      var t = this;
      var url = this.$baseUrl()
      queries.addDogQuery({url:url, variables:t.dog, token:t.$getAuthToken()})
      .then(function(response) {
        t.$router.push('/dogs')
      }).catch(function(res) {
        if (res.response && res.response.data && res.response.data.errors) {
          t.errors = res.response.data.errors
        } else {
          var err = (res && res.response && res.response.data && res.response
            .data.message ?
            res.response.data.message : res)
          t.$root.$emit('globalError', err)
          t.$router.push('/')
        }
      })
    }
  }
}
</script>
`
module.exports.DogRequests = `
import requestGraphql from './request'

export default {

  addDogQuery : function({url, variables, token}){
      let query = \`mutation addDog($name:String $breed:String $personId:Int $researcherId:Int ){
        addDog(name:$name breed:$breed personId:$personId researcherId:$researcherId )
        { id name breed }
      }\`
      return requestGraphql({url, query, variables, token});
    }
}
`
