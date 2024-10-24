const Contact = require('../models/contactModel');

const contactController = {
  createContactForCabinet: (req, res) => {
    const contactData = req.body;
    console.log("Creating contact for cabinet with data:", contactData);
    Contact.createForCabinet(contactData, (err, results) => {
      if (err) {
        console.error("Error creating contact:", err);
        return res.status(500).json({ error: 'Error creating contact' });
      }
      console.log("Contact created successfully:", results);
      res.status(201).json({ message: 'Contact created successfully', data: results });
    });
  },

  getAllContactsFromCabinet: (req, res) => {
    Contact.getAllFromCabinet((err, results) => {
      if (err) {
        console.error("Error fetching contacts from cabinet:", err);
        return res.status(500).json({ error: 'Error fetching contacts from cabinet' });
      }
      res.status(200).json({ data: results });
    });
  },

  getContactsByCabinetId: (req, res) => {
    const idCabinet = req.params.id;
    console.log("Fetching contacts for cabinet with ID:", idCabinet);

    Contact.getByCabinetId(idCabinet, (err, results) => {
      if (err) {
        console.error("Error fetching contacts:", err);
        return res.status(500).json({ error: 'Error fetching contacts' });
      }
      console.log("Contacts fetched successfully:", results);
      res.status(200).json({ data: results });
    });
  },

  updateContactForCabinet: (req, res) => {
    const id = req.params.id;
    const contactData = req.body;
    console.log("Updating contact with ID:", id, "with data:", contactData);
    Contact.updateForCabinet(id, contactData, (err, results) => {
      if (err) {
        console.error("Error updating contact:", err);
        return res.status(500).json({ error: 'Error updating contact' });
      }
      console.log("Contact updated successfully:", results);
      res.status(200).json({ message: 'Contact updated successfully', data: results });
    });
  },

  deleteContactFromCabinet: (req, res) => {
    const id = req.params.id;
    console.log("Deleting contact with ID:", id);
    Contact.deleteFromCabinet(id, (err, results) => {
      if (err) {
        console.error("Error deleting contact:", err);
        return res.status(500).json({ error: 'Error deleting contact' });
      }
      console.log("Contact deleted successfully:", results);
      res.status(200).json({ message: 'Contact deleted successfully', data: results });
    });
  },

  // Méthodes similaires pour les clients avec des logs ajoutés
  createContactForClient: (req, res) => {
    const contactData = req.body;
    console.log("Creating contact for client with data:", contactData);
    Contact.createForClient(contactData, (err, results) => {
      if (err) {
        console.error("Error creating contact:", err);
        return res.status(500).json({ error: 'Error creating contact' });
      }
      console.log("Contact created successfully:", results);
      res.status(201).json({ message: 'Contact created successfully', data: results });
    });
  },
  getAllContactsFromClient: (req, res) => {
    Contact.getAllFromClient((err, results) => {
      if (err) {
        console.error("Error fetching contacts from client:", err);
        return res.status(500).json({ error: 'Error fetching contacts from client' });
      }
      res.status(200).json({ data: results });
    });
  },
  
  getContactsByClientId: (req, res) => {
    const idClient = req.params.id_client;
    console.log("Fetching contacts for client with ID:", idClient);
  
    Contact.getByClientId(idClient, (err, results) => {
      if (err) {
        console.error("Error fetching contacts:", err);
        return res.status(500).json({ error: 'Error fetching contacts' });
      }
      console.log("Contacts fetched successfully:", results);
      res.status(200).json({ data: results });
    });
  },
  

  updateContactForClient: (req, res) => {
    const id = req.params.id;
    const contactData = req.body;
    console.log("Updating contact for client with ID:", id, "with data:", contactData);
    Contact.updateForClient(id, contactData, (err, results) => {
      if (err) {
        console.error("Error updating contact:", err);
        return res.status(500).json({ error: 'Error updating contact' });
      }
      console.log("Contact updated successfully:", results);
      res.status(200).json({ message: 'Contact updated successfully', data: results });
    });
  },

  deleteContactFromClient: (req, res) => {
    const id = req.params.id;
    console.log("Deleting contact from client with ID:", id);
    Contact.deleteFromClient(id, (err, results) => {
      if (err) {
        console.error("Error deleting contact:", err);
        return res.status(500).json({ error: 'Error deleting contact' });
      }
      console.log("Contact deleted successfully:", results);
      res.status(200).json({ message: 'Contact deleted successfully', data: results });
    });
  }
};

module.exports = contactController;
