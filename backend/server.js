const express = require('express');
const db = require('./config/dbconfig'); // Importer le fichier de configuration de la base de données
const userController = require('./controllers/userController');
const cabinetAnnuiteController = require('./controllers/cabinetAnnuiteController');
const cabinetProcedureController = require('./controllers/cabinetProcedureController');
const contactController = require('./controllers/contactController'); // Import du contrôleur
const clientController = require('./controllers/clientController');
const brevetController = require('./controllers/brevetController');
const paysController = require('./controllers/paysController');
const statutsController = require('./controllers/statutsController');
const titulaireController = require('./controllers/titulaireController');
const deposantController = require('./controllers/deposantController');
const inventeurController = require('./controllers/inventeurController');
const cabinetController = require('./controllers//cabinetController')
const NumeroPaysController = require('./controllers/NumeroPaysController');
const fileUpload = require('express-fileupload'); // Import de express-fileupload



const app = express();
const bodyParser = require('body-parser');
const cors = require('cors'); // Ajout de cors

// const multer = require('multer');

// // ** Configuration de multer pour stocker les fichiers en mémoire **
// const storage = multer.memoryStorage();
// const upload = multer({ storage: storage });

const port = 3100;

app.use(cors({
  origin: 'http://localhost:3000', // Remplacez par l'URL de votre frontend
  credentials: true,
}));app.use(bodyParser.json());
app.use(fileUpload());




// _____________________________________________________________ USER ______________________________________________________________


app.post('/users', userController.createUser);
app.get('/users', userController.getAllUsers);
app.get('/users/:id', userController.getUserById);
app.put('/users/:id', userController.updateUser);
app.delete('/users/:id', userController.deleteUser);
app.post('/login', userController.authenticateUser); // Route pour la connexion




//________________________________________________________ route cabinet + numero + pays ______________________________________________________________

app.post('/cabinet', cabinetController.createCabinet);
app.get('/cabinet', cabinetController.getAllCabinets);
app.get('/cabinet/:id', cabinetController.getCabinetById);
app.put('/cabinet/:id', cabinetController.updateCabinet);
app.delete('/cabinet/:id', cabinetController.deleteCabinet);
app.get('/cabinets', cabinetController.getCabinetsByBrevetId);
app.get('/reference', cabinetController.getAllCabinetReferences);




// _____________________________________________________________ CLIENT ______________________________________________________________

app.post('/clients', clientController.createClient);
app.get('/clients', clientController.getAllClients);
app.get('/clients/:id', clientController.getClientById);
app.put('/clients/:id', clientController.updateClient);
app.delete('/clients/:id', clientController.deleteClient);
app.get('/brevets/:brevetId/clients', clientController.getClientsByBrevetId);

// __________________________________________________contact cabinet___________________________________________________________________________
 
app.post('/contacts/cabinets', contactController.createContactForCabinet);
app.get('/contacts/cabinets', contactController.getAllContactsFromCabinet);
app.get('/contacts/cabinets/:id', contactController.getContactsByCabinetId);
app.put('/contacts/cabinets/:id', contactController.updateContactForCabinet);
app.delete('/contacts/cabinets/:id', contactController.deleteContactFromCabinet);

//___________________________________________ Routes pour les contacts des clients____________________________________________
app.post('/contacts/clients', contactController.createContactForClient);
app.get('/contacts/clients', contactController.getAllContactsFromClient);
app.get('/contacts/clients/:id_client', contactController.getContactsByClientId);
app.put('/contacts/clients/:id', contactController.updateContactForClient);
app.delete('/contacts/clients/:id', contactController.deleteContactFromClient);

// _____________________________________________________________ BREVET ______________________________________________________________


app.post('/brevets', brevetController.createBrevet);
app.get('/brevets', brevetController.getAllBrevets);
app.get('/brevets/:id', brevetController.getBrevetById);
app.get('/brevets/:id', brevetController.getByClientId);
app.put('/brevets/:id', brevetController.updateBrevet);
app.delete('/brevets/:id', brevetController.deleteBrevet);
app.get('/brevets/client/:id', brevetController.getByClientId);
app.get('/brevets/:id/piece-jointe', brevetController.getPiecesJointesByBrevetId);


// _____________________________________________________________ PAYS ______________________________________________________________


app.get('/pays', paysController.getAllPays);


// _____________________________________________________________ STATUS ______________________________________________________________


app.get('/statuts', statutsController.getAllStatuts);

// _____________________________________________________________ TITULAIRE ______________________________________________________________

// Routes pour les titulaires
app.get('/titulaire', titulaireController.getTitulaireById);
app.get('/titulaires', titulaireController.getAllTitulaires);
app.post('/titulaires', titulaireController.createTitulaire);
app.put('/titulaires/:id', titulaireController.updateTitulaire);
app.delete('/titulaires/:id', titulaireController.deleteTitulaire);

// ___________________________________________________Routes pour les inventeurs___________________________________________________________________
app.get('/inventeur', inventeurController.getInventeurById);
app.get('/inventeurs', inventeurController.getAllInventeurs);

app.post('/inventeurs', inventeurController.createInventeur);
app.put('/inventeurs/:id', inventeurController.updateInventeur);
app.delete('/inventeurs/:id', inventeurController.deleteInventeur);

// ___________________________________________________________________Routes pour les déposants_____________________________________________________________________
app.get('/deposant', deposantController.getDeposantById);
app.get('/deposants', deposantController.getAllDeposants);
app.post('/deposants', deposantController.createDeposant);
app.put('/deposants/:id', deposantController.updateDeposant);
app.delete('/deposants/:id', deposantController.deleteDeposant);




// app.get('/numeros_pays', NumeroPaysController.getNumeroPaysByBrevetId);






app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
