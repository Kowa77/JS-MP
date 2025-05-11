const mp = new MercadoPago("APP_USR-31042028-7376-4288-94b4-edd6a94f77c1", {
    locale: "es-UY"
});

document.getElementById("checkout-btn").addEventListener("click", async ()=> {
    try {
        const orderData ={
            title: "PELOTITA",
            quantity: 1,
            price: 100
        };

        const response = await fetch("https://servidor-js-mp-production.up.railway.app/create_preference", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const preference = await response.json();
        console.log(preference);
        createCheckoutButton(preference.id);

    } catch (error) {
        alert("Error al crear la preferencia"); 
        console.error(error);
    }   

});

const createCheckoutButton = (preferenceId) => {
const bricksBuilder = mp.bricks();

const renderComponent = async ( ) =>{
    if(window.checkoutButton) window.checkoutButton.unmount();
    
//    await bricksBuilder.bricks().create("wallet", "wallet_container", {
      await bricksBuilder.create("wallet", "wallet_container", {
        initialization: {
            preferenceId: preferenceId
        },
        customization: {
            visual: {
                theme: "dark",
                color: "#000000",
                logo: "https://www.mercadopago.com.uy/fp/checkout/checkout.png"
            }
        },
        callbacks: {
            onReady: () => {
                console.log("Bricks initialized");
            },
            onError: (error) => {
                console.error("Error initializing bricks", error);
            }
        }
    });
}
    renderComponent();
    bricksBuilder.bricks().renderAll();
    console.log("Bricks rendered");
};






    
