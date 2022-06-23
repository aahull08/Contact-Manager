document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".home").classList.toggle("active");
  renderContacts()

  document.querySelector(".contact-btn, .add").addEventListener("click", (e) => {
    e.preventDefault();
    clearForm();
    toggleActive("Create");
  });

  document.querySelector(".cancel").addEventListener("click", (e) => {
    e.preventDefault();
    toggleActive();
  })

  document.querySelector("#contact-list").addEventListener("click", (e) => {
    let node = e.target.parentNode.tagName === 'A' ? e.target.parentNode : e.target;
    if (node.tagName !== 'A'){
      return;
    }
    e.preventDefault();
    if (node.classList.contains("remove")){
      deleteContact(node.href)
      renderContacts();
    } else {
      getSingleContact(node.href);
      toggleActive("Edit");
      

    }
  })
  
  document.querySelector("form").addEventListener("submit", async(e) => {
    e.preventDefault();
    let data = new FormData(e.target);
    data = Object.fromEntries(data.entries());
    let tags = document.querySelectorAll('input[type="checkbox"]:checked');
    tags = Array.from(tags).map(x => x.value);
    data["tags"] = tags.join(",");
    let json = JSON.stringify(data);

    if (document.querySelector("#contactId").value === "") {
      await createContact(json);
    } else {
      await editContact(json, document.querySelector("#contactId").value);
    }

    renderContacts();
    toggleActive();
  })

});

async function editContact(jsonData, id){
  console.log(id)
  let result = await fetch(`http://localhost:3000/api/contacts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonData,
    });

  console.log(result);
}

function createContact(jsonData){
  let result = (async() => {
    return await fetch("http://localhost:3000/api/contacts/", { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: jsonData} );
  })();
  return result;
}

function deleteContact(href){
  let result = (async() => {
    return await fetch(href, { method: 'DELETE'} );
  })();
  return result;
}

function toggleActive(formName){
  document.querySelector(".home").classList.toggle("active");
  document.querySelector("#contact-form").classList.toggle("active");
  if (formName){
    document.querySelector("h3").textContent = formName + " Contact"
  }
}

async function renderContacts(){
  let contacts;
  const settings = {
    method: "GET",
    headers: {
      'Response-Type': 'application/json',
    }
  }

  await fetch("http://localhost:3000/api/contacts", settings)
  .then(response => response.json())
  .then(json => {
    contacts = json;
    });

  let contactCardTemplate = Handlebars.compile(document.querySelector('#contactsTemplate').innerHTML);
  let contactList = document.querySelector("#contact-list");
  contactList.innerHTML = contactCardTemplate({ contacts });
  
}

async function getSingleContact(href){
  let contact;
  const settings = {
    method: "GET",
    headers: {
      'Response-Type': 'application/json',
    }
  };

  await fetch(href, settings)
  .then(response => response.json())
  .then(json => contact = json);

  fillInForm(contact);

}

function fillInForm(contact){
  clearForm()
  document.querySelector("#contactId").value = contact.id;
  document.querySelector("#full_name").value = contact.full_name;
  document.querySelector("#email").value = contact.email;
  document.querySelector("#phone_number").value = contact.phone_number;
  if (contact.tags){
    contact.tags.split(",").forEach(checkedTag => {
      document.querySelector(`#${checkedTag}`).checked = true;
    });
  };
}

function clearForm(){
  document.querySelector("#contactId").value = "";
  document.querySelector("#full_name").value = "";
  document.querySelector("#email").value = "";
  document.querySelector("#phone_number").value = "";
  Array.prototype.slice.call(document.querySelectorAll("input[type=checkbox]")).forEach(input => {
    input.checked = false;
  });
}