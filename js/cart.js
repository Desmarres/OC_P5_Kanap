/* récupération de la section du DOM dynamique*/
var sectionCartItems = document.getElementById("cart__items");

/* récupération des élément totaux du panier*/
var spanTotalQuantity = document.getElementById("totalQuantity");
var spanTotalPrice = document.getElementById("totalPrice");

/* récuperation du panier */
var bagJSON = localStorage.getItem("article");
var bag = bagJSON && JSON.parse(bagJSON);

/* récupération des éléments du formulaire*/
var inputFirstName = document.getElementById("firstName");
var inputLastName = document.getElementById("lastName");
var inputAddress = document.getElementById("address");
var inputCity = document.getElementById("city");
var inputEmail = document.getElementById("email");
var inputOrder = document.getElementById("order");

/* ajout des placeholders */
inputFirstName.setAttribute("placeholder","Pierre");
inputLastName.setAttribute("placeholder","Dupont");
inputAddress.setAttribute("placeholder",'10 quai de la charente');
inputCity.setAttribute("placeholder","75019 Paris 19");
inputEmail.setAttribute("placeholder","support@name.com");

/* création des regex*/
var regexName = new RegExp("^[A-Za-zÀ-ÖØ-öø-ÿ \-]+$");
var regexAdress = new RegExp("^[A-Za-zÀ-ÖØ-öø-ÿ0-9 \-]+$");
var regexCity = new RegExp("^[0-9]{5} [A-Za-zÀ-ÖØ-öø-ÿ0-9 \-]+$");
var regexEmail = new RegExp("^[A-Za-z_0-9!#$%&'*+/=?^_`{|}~. \-]+@(([A-z0-9 \-]+\.[A-z]{2,3})|(([0-9]{1,3}[.]){3}[0-9]{1,3}))$");

/*une fois le DOM chargé*/
document.addEventListener('DOMContentLoaded', function(event) {

    /* si le panier existe*/
    if (localStorage.getItem("article")){
        displayBag();  
    }
    else{
        emptyBag();
    }

    displayTotal(bag);

    /*contrôle des données saisies*/
    validateData(inputFirstName,regexName);
    validateData(inputLastName,regexName);
    validateData(inputAddress,regexAdress);
    validateData(inputCity,regexCity);
    validateData(inputEmail,regexEmail);

    /* validation commande */
    orderValidate();

});

function getProductById(id) {
    return fetch("https://desmarres-p5-kanap.herokuapp.com/api/products/" + id)
    .then(function(res){
        if (res.ok) {
            return res.json();
        }
    })
    .catch(function(err){
        console.log("Une erreur est survenue lors de la récupération des produits : " + err);
    });
}

function postOrder(order){
    return fetch("https://desmarres-p5-kanap.herokuapp.com/api/products/order",{
        method: "POST",
        headers: {
            'Accept': 'application/json', 
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
    })
    .then(function(res){
        if (res.ok) {
            return res.json();
        }
    })
    .catch(function(err){
        console.log("Une erreur est survenue lors de l'envoi de la commande : " + err);
    });
}

/* fonction affichage panier*/
async function displayBag(){
    /*on parcourt l'ensemble du panier*/
    for (var i = 0; i < bag.length; i++){

        /* récupération du produits de l'API*/
        var product = await getProductById(bag[i].id);

        /*création des éléments p du produit*/               
        var elementPColor = document.createElement("p");
        elementPColor.innerHTML = bag[i].color;

        var elementPPrice = document.createElement("p");
        elementPPrice.innerHTML = product.price + " €";

        var elementPQuantity = document.createElement("p");
        elementPQuantity.innerHTML = "Qté : ";

        var elementPDeleteItem = document.createElement("p");
        elementPDeleteItem.classList.add("deleteItem");
        elementPDeleteItem.innerHTML = "Supprimer";

        /*création de l'élément input du produit*/
        var elementInput = document.createElement("input");
        elementInput.classList.add("itemQuantity");
        elementInput.setAttribute("type","number");
        elementInput.setAttribute("name","itemQuantity");
        elementInput.setAttribute("min","1");
        elementInput.setAttribute("max","100");
        elementInput.setAttribute("value",bag[i].quantity);

        /*création de l'élément H2 "title" du produit*/
        var elementH2 = document.createElement("h2");
        elementH2.innerHTML = product.name;

        /*création de l'élément Img du produit*/     
        var elementImg = document.createElement("img");
        elementImg.setAttribute("src",product.imageUrl.replace("p","ps"));
        elementImg.setAttribute("alt",product.altTxt);
        
        /*création de l'élément Article du produit*/     
        var elementArticle = document.createElement("article");
        elementArticle.classList.add("cart__item");
        elementArticle.setAttribute("data-id",product._id);
        elementArticle.setAttribute("data-color",bag[i].color);

        /*création des éléments div du produit*/
        var elementDivCartItemImg = document.createElement("div");
        elementDivCartItemImg.classList.add("cart__item__img");
        
        var elementDivCartItemContent = document.createElement("div");
        elementDivCartItemContent.classList.add("cart__item__content");

        var elementDivCartItemContentDescription = document.createElement("div");
        elementDivCartItemContentDescription.classList.add("cart__item__content__description");
        
        var elementDivCartItemContentSetting = document.createElement("div");
        elementDivCartItemContentSetting.classList.add("cart__item__content__settings");
        
        var elementDivCartItemContentSettingQuantity = document.createElement("div");
        elementDivCartItemContentSettingQuantity.classList.add("cart__item__content__settings__quantity");
        
        var elementDivCartItemContentSettingDelete = document.createElement("div");
        elementDivCartItemContentSettingDelete.classList.add("cart__item__content__settings__delete");

        /*ajout des éléments aux DOM*/
        elementDivCartItemContentSettingDelete.appendChild(elementPDeleteItem);

        elementDivCartItemContentSettingQuantity.appendChild(elementPQuantity);
        elementDivCartItemContentSettingQuantity.appendChild(elementInput);

        elementDivCartItemContentSetting.appendChild(elementDivCartItemContentSettingQuantity);
        elementDivCartItemContentSetting.appendChild(elementDivCartItemContentSettingDelete);

        elementDivCartItemContentDescription.appendChild(elementH2);
        elementDivCartItemContentDescription.appendChild(elementPColor);
        elementDivCartItemContentDescription.appendChild(elementPPrice);

        elementDivCartItemContent.appendChild(elementDivCartItemContentDescription);
        elementDivCartItemContent.appendChild(elementDivCartItemContentSetting);

        elementDivCartItemImg.appendChild(elementImg);

        elementArticle.appendChild(elementDivCartItemImg);
        elementArticle.appendChild(elementDivCartItemContent);

        sectionCartItems.appendChild(elementArticle);
        removeQuantityProduct(elementInput);
        deleteProduct(elementPDeleteItem);
    }
}

/* fonction calcul nb articles et totals price*/
async function displayTotal(bag){

    var total = 0;

    for (i = 0 ; i < bag.length ; i++){

        /* récupération du produits de l'API*/
        var product = await getProductById(bag[i].id);
        total += parseInt(bag[i].quantity) * parseInt(product.price);
    }

    /*Modification affichage des totaux*/
    spanTotalQuantity.innerHTML = bag.length;
    spanTotalPrice.innerHTML = total;
}

/* fonction modification de la quantité du produit dans le panier*/
function removeQuantityProduct(elementInput){

    /*ecoute de la modification de quantité du produit */
    elementInput.addEventListener('change',function(){

        /*recupération de l'objet article parent*/
        var article = elementInput.closest("article");

        /*parcours du panier */
        for (var i = 0; i < bag.length; i++){

            /* recherche du produit*/
            if ((bag[i].id == article.dataset.id) && (bag[i].color == article.dataset.color)){

                /*vérification que la quantité est bien correcte*/
                if (( 0 < parseInt(elementInput.value)) && (101 > parseInt(elementInput.value))){

                    bag[i].quantity = parseInt(elementInput.value);
                
                    /* mise a jour du panier dans le local Storage*/
                    localStorage.setItem("article", JSON.stringify(bag));
                    
                    /*Modification affichage des totaux*/
                    displayTotal(bag);
    
                }
                else{
                    alert("Veuillez saisir un nombre entre 1 et 100");
                    sectionCartItems.removeChild(article);
                    displayBag();
                }

                i = bag.length;
            }
        }
    })
}

/*fonction suppression d'un element du panier*/
function deleteProduct(deleteItem){

    deleteItem.addEventListener('click',function(){

        var article = deleteItem.closest("article");

        for (var i = 0; i < bag.length; i++){

            /* recherche du produit*/
            if ((bag[i].id == article.dataset.id) && (bag[i].color == article.dataset.color)){
                
                var productDelete = bag.splice(i,1);

                sectionCartItems.removeChild(article);
                
                if (bag.length == 0){
                    localStorage.clear();
                    emptyBag();
                }
                else{
                    /* mise a jour du panier dans le local Storage*/
                    localStorage.setItem("article", JSON.stringify(bag));
                }

                /*Modification affichage des totaux*/
                displayTotal(bag);

                i = bag.length;

            }
        }
    })
}

function validateData(element,regex){
    element.addEventListener('change',function(saisie){

        var value = saisie.target.value;

        var elementErrorMsg = element.nextElementSibling;
        var elementLabel = element.previousElementSibling;

        if (regex.test(value)){
            elementErrorMsg.innerHTML = "";
        }else{
            if (element.id == inputCity.id){
                elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner le code postal puis la ville (Ex : 75019 Paris 19).";
            }
            else{
                if (element.id == inputEmail.id){
                    elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner un email valide (Ex : support@name.com).";
                }
                else{
                    elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner un " + elementLabel.innerHTML.replace(":","") + " correct.";
                }
            }
        };
    })
}

/* function commander */
async function buyBag(){
    var listeIdProduct = [];

    /*on parcourt l'ensemble du panier*/
    for (var i = 0; i < bag.length; i++){
        listeIdProduct [i] = bag[i].id;
    }

    var order = {
        contact : {
            firstName: inputFirstName.value,
            lastName: inputLastName.value,
            address: inputAddress.value,
            city: inputCity.value,
            email: inputEmail.value
        },
        products : listeIdProduct
    }

    redirectionConfirmationOrder(await postOrder(order));
}

/* function redirection vers confirmation*/
function redirectionConfirmationOrder(order){
    localStorage.clear();
    document.location.href = "confirmation.html?id=" + order.orderId;
}

/* function validation commande */
function orderValidate(){
    inputOrder.addEventListener("click",function(event){

        event.preventDefault();

        var elementOrderQuestion = document.getElementsByClassName("cart__order__form__question");
        var errorMsg ="";

        for (var i = 0; i < elementOrderQuestion.length; i++){
            errorMsg += elementOrderQuestion[i].children[2].innerHTML;
            console.log(errorMsg);
        }

        /*si le formulaire est valide*/
        if (errorMsg == ""){
            buyBag();
        }
        else{
            console.log("formulaire invalide");
        }
    })
}

function emptyBag(){
    /* message panier vide*/
    sectionCartItems.innerHTML = "Votre panier est vide";
    sectionCartItems.style.textAlign = "center";
    sectionCartItems.style.marginBottom = "90px";
    sectionCartItems.style.fontSize = "25px";
    bag = [];
}