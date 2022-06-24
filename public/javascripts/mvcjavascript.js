class Model{
  constructor() {
  }

  async addContact(formInfo){
    let response = await this.makeFetchRequest(`http://localhost:3000/api/contacts/`, "POST", formInfo)
    if (response.ok) {
      alert("Contact was added")
    } else {
      alert("Something went wrong, Try again.")
      console.log("HTTP Error: " + response.status)
    }
  }

  async editContact(updatedFormData, id){
    let response = await this.makeFetchRequest(`http://localhost:3000/api/contacts/${id}`, "PUT", updatedFormData);
    if (response.ok){
      alert("Contact was updated");
    } else {
      alert("Something went wrong, Try again.")
      console.log("HTTP Error: " + response.status)
    }
  }

  async removeContact(id){
    let response = await this.makeFetchRequest(`http://localhost:3000/api/contacts/${id}`, "DELETE")
    if (response.ok) {
      alert("Contact was deleted")
    } else {
      alert("Something went wrong, Try again.")
      console.log("HTTP Error: " + response.status)
    }
  }

  async getContacts(){
    let response = await this.makeFetchRequest("http://localhost:3000/api/contacts", "GET");
    if (response.ok) {
      let data = await response.json();
      return data;
    } else {
      alert("Something went wrong, Try again.")
      console.log("HTTP Error: " + response.status)
    }
  }

  async getContact(id){
    let response = await this.makeFetchRequest(`http://localhost:3000/api/contacts/${id}`, "GET")
    if (response.ok) {
      let data = await response.json();
      return data;
    } else {
      alert("Something went wrong, Try again.")
      console.log("HTTP Error: " + response.status)
    }
  }

  async getConatactsForTags(tags){

  }

  async makeFetchRequest(url, method, data){
    let response;

    let settings = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Response-Type': 'application/json',
      },
      body: data,
    }
    response = await fetch(url, settings)
    return response;
  }
  
}

class View{
  constructor() {
    this.main = this.getElement("main");
    this.home = this.getElement(".home");
    this.contactForm = this.getElement("#contact-form");
    this.form = this.getElement("form");
    this.clearSearch();
    this.resetTag();
  }

  createElement(tag, className){
    const element = document.createElement(tag);
    if (className) {
      element.classList.add(className);
    }

    return element;
  }

  getElement(selector){
    const element = document.querySelector(selector);
    return element;
  }

  toggleView(type){
    this.clearForm();
    if (type) {
      this.getElement("h3").textContent = type + " Contact";
    }
    this.home.classList.toggle("active");
    this.contactForm.classList.toggle("active");

  }

  displayContacts(contacts){
    let contactCardTemplate = Handlebars.compile(document.querySelector('#contactsTemplate').innerHTML);
    let contactList = document.querySelector("#contact-list");
    contactList.innerHTML = contactCardTemplate({ contacts });
  }

  clearForm(){
    console.log(this.form)
    this.form.reset();
  }

  clearSearch(){
    this.getElement("#search-bar").value = "";
  }

  resetTag(){
    this.getElement("#tags").value = "all";
  }
  displayEditForm(data){
    this.getElement("#contactId").value = data.id;
    this.getElement("#full_name").value = data.full_name;
    this.getElement("#email").value = data.email;
    this.getElement("#phone_number").value = data.phone_number;
    data.tags.split(",").forEach(tag => {
      this.getElement(`#${tag}`).checked = true;
    })
  }

  matchString(contactCard){
    let searchString = this.getElement("#search-bar").value;
    let name = contactCard.firstElementChild.textContent.slice(0, searchString.length);
    return (searchString.toLowerCase() === name.toLowerCase() || searchString === "")
  }

  matchTag(contactCard){
    let tag = this.getElement("#tags").value;
    let contactTags = contactCard.querySelector(".contact-Tags").textContent;
    return (contactTags.includes(tag) || tag == "all")
  }

  filter(){
    let contactCards = Array.prototype.slice.call(document.querySelectorAll(".contact-card"));
    contactCards.forEach(contactCard => {
      if (this.matchString(contactCard) && this.matchTag(contactCard)){
        contactCard.classList.remove("ishidden");
      } else {
        contactCard.classList.add("ishidden");
      }
    });
  }
}

class Controller{
  constructor(model, view){
    this.model = model;
    this.view = view;
    this.getHome();
  }

  async getHome(){
    await this.view.displayContacts(await this.model.getContacts())
  }

  async addContact(json){
    await this.model.addContact(json);
    this.view.toggleView();
    await this.view.displayContacts(await this.model.getContacts());
  }

  async removeContact(id){
    await this.model.removeContact(id);
    await this.view.displayContacts(await this.model.getContacts());
  }

  async editContactForm(id){
    let contactData = await this.model.getContact(id);
    this.view.toggleView("Edit")
    await this.view.displayEditForm(contactData);
  }

  async editContact(json, id){
    await this.model.editContact(json, id);
    this.view.toggleView();
    await this.view.displayContacts(await this.model.getContacts());
  }

  search(string){
    this.view.filterContacts(string);
  }

  filterContactsByTag(tag){
    this.view.filterContactsByTag(tag);
  }

  filter(){
    this.view.filter();
  }

  toggleView(type){
    this.view.toggleView(type)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new Controller(new Model(), new View());
  document.querySelector(".add").addEventListener("click", (e) => {
    e.preventDefault();
    app.toggleView("Create");
  })

  document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    data = Object.fromEntries(data.entries());
    let tags = document.querySelectorAll('input[type="checkbox"]:checked');
    tags = Array.from(tags).map(x => x.value);
    data["tags"] = tags.join(",");
    let json = JSON.stringify(data);
    if (data.contactId) {
      app.editContact(json, data.contactId);
    } else {
      app.addContact(json);
    }



  });

  document.querySelector("#contact-list").addEventListener("click", (e) => {
    e.preventDefault();
    let node = e.target.parentNode.tagName === 'A' ? e.target.parentNode : e.target;
    if (node.tagName !== 'A'){
      return;
    };
    if (node.classList.contains("remove")){
      app.removeContact(node.id)
    } else {
      app.editContactForm(node.id);
    };
  });

  document.querySelector("#search-bar").addEventListener("keyup", (e) => {
    if(e.key.match(/^[0-9a-zA-Z]$/) || e.key === "Backspace"){
      app.filter();
    }
  });

  document.querySelector("#tags").addEventListener("change", (e) => {
    app.filter();
  });
});
