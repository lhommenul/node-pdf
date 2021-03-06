const Document = require('./modules/Document');
const Config = require('./modules/Config')

const example_data = require('./decompte_data.json')

// GENERATE PDF

const config = new Config({
  header:"<header>je suis le header</header>"
  ,footer:"<footer>je suis le footer</footer>"
  ,landscape:false
  ,format:'A4'
  ,margin:{
    top:0
    ,left:0
    ,right:0 
    ,bottom:0 
  }
});

const pdf = new Document({
  config:config
  ,data:[{
    type:'table'
    ,header:[
      {
        name:"firstname"
      },
      {
        name:"name"
      },
      {
        name:"nickname"
      },
    ]
    ,data:example_data
  }]
})

pdf.generateHtml();

pdf.generatePreview();

