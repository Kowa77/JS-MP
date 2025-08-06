const mp = new MercadoPago("APP_USR-31042028-7376-4288-94b4-edd6a94f77c1", {
    locale: "es-UY" // Define el idioma y la localización
});

// Espera a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener("DOMContentLoaded", function() {
    // Obtiene referencias a los elementos del DOM
    const checkoutButton = document.getElementById("checkout-btn");
    const loadingMessage = document.getElementById("loading-message");
    const walletContainer = document.getElementById("wallet_container"); // Contenedor para el botón de MP

    // Agrega un event listener al botón de "Comprar"
    checkoutButton.addEventListener("click", async () => {
        try {
            // 1. Oculta el botón de "Comprar" y muestra el mensaje de carga
            checkoutButton.style.display = 'none';
            loadingMessage.style.display = 'block';

            // 2. Define los datos del producto a enviar al backend
            const orderData = {
                title: "PELOTITA",
                quantity: 1,
                price: 100
            };

            // 3. Realiza la petición POST a tu backend para crear la preferencia de pago
            // Asegúrate de que "https://js-mp-api.onrender.com" es la URL de tu backend desplegado
            const response = await fetch("https://js-mp-api.onrender.com/create_preference", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(orderData)
            });

            // Verifica si la respuesta de la red fue exitosa
            if (!response.ok) {
                // Si la respuesta no es OK (ej. 400, 500), lanza un error
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error desconocido al crear la preferencia.');
            }

            // Parsea la respuesta JSON
            const preference = await response.json();
            console.log("Preferencia creada:", preference);

            // 4. Oculta el mensaje de carga
            loadingMessage.style.display = 'none';

            // 5. Llama a la función para crear y renderizar el botón de Mercado Pago
            // Pasamos preference.id que es lo que necesitamos para el Wallet Brick
            createCheckoutButton(preference.id);

        } catch (error) {
            // Manejo de errores: muestra un mensaje al usuario y vuelve a mostrar el botón original
            console.error('Error en el proceso de compra:', error);
            // Usamos un modal o un div en lugar de alert() para mejor UX
            // Para este ejemplo, usaremos alert() pero se recomienda un modal personalizado
            alert("Error al crear la preferencia: " + error.message);

            // Vuelve a mostrar el botón de "Comprar" y oculta el mensaje de carga
            checkoutButton.style.display = 'block';
            loadingMessage.style.display = 'none';
        }
    });

    // Función para crear y renderizar el botón de Checkout de Mercado Pago (Wallet Brick)
    const createCheckoutButton = (preferenceId) => {
        // Obtiene la instancia de Bricks
        const bricksBuilder = mp.bricks();

        // Función asíncrona para renderizar el componente Wallet
        const renderComponent = async () => {
            // Si ya existe un botón de checkout, lo desmonta para evitar duplicados
            if (window.checkoutButton) {
                window.checkoutButton.unmount();
            }

            // Crea el componente "wallet" en el contenedor "wallet_container"
            window.checkoutButton = await bricksBuilder.create("wallet", "wallet_container", {
                initialization: {
                    preferenceId: preferenceId // ID de la preferencia obtenida del backend
                },
                customization: {
                    visual: {
                        theme: "dark", // Tema visual del botón
                        color: "#000000", // Color del botón
                        // logo: "https://www.mercadopago.com.uy/fp/checkout/checkout.png" // Logo opcional
                    },
                    // Puedes añadir más personalizaciones aquí
                    texts: {
                        valueProp: 'smart_option', // Muestra "Paga de forma segura" o similar
                    },
                },
                callbacks: {
                    onReady: () => {
                        // Callback cuando el Brick está listo
                        console.log("Bricks initialized");
                        // Aquí puedes añadir lógica adicional si el botón de MP se carga tarde
                        // Por ejemplo, asegurar que el walletContainer esté visible
                        walletContainer.style.display = 'block'; // Asegura que el contenedor del botón de MP sea visible
                    },
                    onError: (error) => {
                        // Callback en caso de error al inicializar el Brick
                        console.error("Error initializing bricks", error);
                        alert("Error al inicializar el botón de pago."); // Informa al usuario
                        // Vuelve a mostrar el botón original si el Brick falla
                        checkoutButton.style.display = 'block';
                        loadingMessage.style.display = 'none';
                    }
                }
            });
        };

        // Llama a la función para renderizar el componente
        renderComponent();
        console.log("Bricks renderization initiated"); // El Brick se renderiza asíncronamente
    };
});
