/* récupération de la section du DOM dynamique*/
var sectionCartItems = document.getElementById("cart__items");

/* récupération des élément totaux du panier*/
var spanTotalQuantity = document.getElementById("totalQuantity");
var spanTotalPrice = document.getElementById("totalPrice");

/* récuperation du panier */
var bagJSON = localStorage.getItem("article");
var bag = bagJSON && JSON.parse(bagJSON);

/* récupération des éléments du formulaire*/
var elementCartOrder = document.querySelector("div.cart__order > form.cart__order__form");
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
var regexEmail = new RegExp("^[A-Za-z_0-9!#$%&'*+\/=?^_`{|}~.\-]+@(([A-z0-9\-]+\.[A-z]{2,3})|(([0-9]{1,3}[.]){3}[0-9]{1,3}))$");

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
    inputOrder.style.display = "none";
    validateData(inputFirstName,regexName);
    validateData(inputLastName,regexName);
    validateData(inputAddress,regexAdress);
    validateData(inputCity,regexCity);
    validateData(inputEmail,regexEmail);

    /* validation commande */
    orderValidate();

});

function getProductInApiById(id) {
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
    for (let i in bag){

        /* récupération du produits de l'API*/
        let product = await getProductInApiById(bag[i].id);

        /*création des éléments p du produit*/               
        let elementPColor = document.createElement("p");
        elementPColor.innerHTML = bag[i].color;

        let elementPPrice = document.createElement("p");
        elementPPrice.innerHTML = product.price + " €";

        let elementPQuantity = document.createElement("p");
        elementPQuantity.innerHTML = "Qté : ";

        let elementPDeleteItem = document.createElement("p");
        elementPDeleteItem.classList.add("deleteItem");
        elementPDeleteItem.innerHTML = "Supprimer";

        /*création de l'élément input du produit*/
        let elementInput = document.createElement("input");
        elementInput.classList.add("itemQuantity");
        elementInput.setAttribute("type","number");
        elementInput.setAttribute("name","itemQuantity");
        elementInput.setAttribute("min","1");
        elementInput.setAttribute("max","100");
        elementInput.setAttribute("value",bag[i].quantity);

        /*création de l'élément H2 "title" du produit*/
        let elementH2 = document.createElement("h2");
        elementH2.innerHTML = product.name;

        /*création de l'élément Img du produit*/     
        let elementImg = document.createElement("img");
        elementImg.setAttribute("src",product.imageUrl.replace("p","ps"));
        elementImg.setAttribute("alt",product.altTxt);
        
        /*création de l'élément Article du produit*/     
        let elementArticle = document.createElement("article");
        elementArticle.classList.add("cart__item");
        elementArticle.setAttribute("data-id",product._id);
        elementArticle.setAttribute("data-color",bag[i].color);

        /*création des éléments div du produit*/
        let elementDivCartItemImg = document.createElement("div");
        elementDivCartItemImg.classList.add("cart__item__img");
        
        let elementDivCartItemContent = document.createElement("div");
        elementDivCartItemContent.classList.add("cart__item__content");

        let elementDivCartItemContentDescription = document.createElement("div");
        elementDivCartItemContentDescription.classList.add("cart__item__content__description");
        
        let elementDivCartItemContentSetting = document.createElement("div");
        elementDivCartItemContentSetting.classList.add("cart__item__content__settings");
        
        let elementDivCartItemContentSettingQuantity = document.createElement("div");
        elementDivCartItemContentSettingQuantity.classList.add("cart__item__content__settings__quantity");
        
        let elementDivCartItemContentSettingDelete = document.createElement("div");
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

        /* mise en place des modifications panier*/
        removeQuantityProduct(elementInput);
        deleteProduct(elementPDeleteItem);
    }
}

/* fonction calcul nb articles et totals price*/
async function displayTotal(bag){

    let total = 0;

    for (let i in bag){

        /* récupération du produits de l'API*/
        let product = await getProductInApiById(bag[i].id);
        total += parseInt(bag[i].quantity) * parseInt(product.price);
    }

    /*Modification affichage des totaux*/
    spanTotalQuantity.innerHTML = bag.length;
    spanTotalPrice.innerHTML = total;
}

/* fonction récupération de l'index du produit dans le panier */
function getProductInBagById(article){

    const index = bag.findIndex(bagProduct => bagProduct.id === article.dataset.id && bagProduct.color === article.dataset.color);

    return index
}

/* fonction modification de la quantité du produit dans le panier*/
function removeQuantityProduct(elementInput){

    /*ecoute de la modification de quantité du produit */
    elementInput.addEventListener('change',function(event){

        event.preventDefault();

        /*vérification que la quantité est bien correcte*/
        if (!( 0 < parseInt(elementInput.value) && 101 > parseInt(elementInput.value))){
            alert("Veuillez saisir un nombre entre 1 et 100");
            elementInput.value = event.target.defaultValue;
        }
        else{
            /*recupération de l'objet article parent*/
            let article = elementInput.closest("article");

            const index = getProductInBagById(article);
            
            /* si le produit éxiste */
            if (index !== -1){

                bag[index].quantity = parseInt(elementInput.value);

                /* mise a jour du panier dans le local Storage*/
                localStorage.setItem("article", JSON.stringify(bag));
                
                /*Modification affichage des totaux*/
                displayTotal(bag);
            }
            else{
                alert("Erreur de mise à jour panier");
            }
        }    
    })
}

/*fonction suppression d'un element du panier*/
function deleteProduct(deleteItem){

    deleteItem.addEventListener('click',function(){

        let article = deleteItem.closest("article");
       
        const index = getProductInBagById(article);

        /* si le produit éxiste */
        if (index !== -1){
            
            let productDelete = bag.splice(index,1);

            sectionCartItems.removeChild(article);
            
            if (bag.length === 0){
                localStorage.clear();
                emptyBag();
            }
            else{
                /* mise a jour du panier dans le local Storage*/
                localStorage.setItem("article", JSON.stringify(bag));
            }

            /*Modification affichage des totaux*/
            displayTotal(bag);

        }
        else{
            alert("Erreur de mise à jour panier");
        }
    })
}

function validateData(element,regex){
    element.addEventListener('input',function(saisie){
        let value = saisie.target.value;

        let elementErrorMsg = element.nextElementSibling;
        let elementLabel = element.previousElementSibling;
        
        if (regex.test(value) || value === ""){
            elementErrorMsg.innerHTML = "";
        }else{
            switch (element.id){
                case inputAddress.id :
                    elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner une " + elementLabel.innerHTML.replace(":","") + " correct.";
                break;
                case inputCity.id :
                    elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner le code postal puis la ville (Ex : 75019 Paris 19).";
                break;
                case inputEmail.id :
                    elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner un email valide (Ex : support@name.com).";
                break;
                default:
                    elementErrorMsg.innerHTML = "Saisie incorrecte, veuillez renseigner un " + elementLabel.innerHTML.replace(":","") + " correct.";
            }
        }
        displayOrder();
    })
}

/* function commander */
async function buyBag(){
    let listeIdProduct = [];

    /*on parcourt l'ensemble du panier*/
    for (let i in bag){
        listeIdProduct [i] = bag[i].id;
    }

    let order = {
        contact : {
            firstName: inputFirstName.value,
            lastName: inputLastName.value,
            address: inputAddress.value,
            city: inputCity.value,
            email: inputEmail.value
        },
        products : listeIdProduct
    }

    let orderResponse = await postOrder(order);
    let orderResponseValidate = orderControleOrder(order,orderResponse);

    if (orderResponseValidate === true){
        redirectionConfirmationOrder(orderResponse);
    }
    else{
        alert("La commande n'a pas aboutie.");
    }
}

/* function contrôle retour requête POST API*/
function orderControleOrder(order,orderResponse){

    /* on vérifie que les éléments de l'objet contact retourné sont les mêmes que celles envoyées et qu'il y a le même nombre de produits*/
    if (JSON.stringify(order.contact) === JSON.stringify(orderResponse.contact) && order.products.length === orderResponse.products.length){

        /* on vérifie que les id produits retournés sont les mêmes que ceux envoyés*/
        for(let i in order.products){

            if (order.products[i] !== orderResponse.products[i]._id)
            {
                return false;
            }
        }
        return true;
    }
    else
    {
        return false;
    }
}

/* function redirection vers confirmation*/
function redirectionConfirmationOrder(order){
    localStorage.clear();
    document.location.href = "confirmation.html?id=" + order.orderId;
}

/* function validation commande */
function orderValidate(){
    inputOrder.addEventListener("click",function(event){

        /*stop la propagation de l'element*/
        event.preventDefault();

        buyBag();
    })
}

function displayOrder(){

    let elementOrderQuestion = document.getElementsByClassName("cart__order__form__question");
    let errorMsg = false;
    let completenessInput = true;

    /* parcours l'ensemble des élément class='cart__order__form__question' */
    for (let i = 0; i < elementOrderQuestion.length; i++){

        /* si l'input n'a pas de valeur*/
        if (elementOrderQuestion[i].children[1].value === ""){
            completenessInput = false;
        }

        /* si il y a un message d'errreur*/
        if (elementOrderQuestion[i].children[2].innerHTML != ""){
            errorMsg = true;
        }
    }

    /*si le formulaire est valide*/
    if (errorMsg === false && completenessInput === true){
        inputOrder.style.display = "inline";
    }
    else{
        inputOrder.style.display = "none";
    }
}

function emptyBag(){
    /* message panier vide*/
    sectionCartItems.innerHTML = "Votre panier est vide";
    sectionCartItems.style.textAlign = "center";
    sectionCartItems.style.marginBottom = "90px";
    sectionCartItems.style.fontSize = "25px";
    elementCartOrder.style.display = "none";
    bag = [];
}