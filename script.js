document.addEventListener('DOMContentLoaded', () => {
    const columnItems = document.querySelectorAll('.column-item');
    const detailSection = document.getElementById('detail-section');
    const closeButton = document.querySelector('.close-button');
    const detailPanels = document.querySelectorAll('.detail-panel'); // Todos los paneles principales

    // Un objeto para mantener el índice del sub-carrusel actual para cada panel principal
    const currentSubPanelIndex = {};

    // Función para mostrar un sub-panel específico dentro de un detail-panel dado
    function showSubPanel(panelId, index) {
        const detailPanel = document.getElementById(panelId);
        if (!detailPanel) return;

        const subCarouselInner = detailPanel.querySelector('.sub-carousel-inner');
        const subPanels = detailPanel.querySelectorAll('.sub-panel');

        if (subPanels.length === 0) return;

        // Asegurarse de que el índice esté dentro de los límites
        if (index < 0) {
            index = subPanels.length - 1; // Volver al último
        } else if (index >= subPanels.length) {
            index = 0; // Volver al primero
        }
        currentSubPanelIndex[panelId] = index; // Actualizar el índice para este panel principal

        // Calcula el desplazamiento horizontal
        const subPanelWidth = subPanels[0].offsetWidth; // Asume que todos los sub-paneles tienen el mismo ancho
        const offsetX = -currentSubPanelIndex[panelId] * subPanelWidth;

        // Anima el contenedor del sub-carrusel para moverlo
        gsap.to(subCarouselInner, {
            x: offsetX,
            duration: 0.6,
            ease: "power2.out",
            onComplete: () => {
                // Después de que el sub-carrusel se ha movido, anima el sub-panel visible
                subPanels.forEach((subPanel, i) => {
                    if (i === currentSubPanelIndex[panelId]) {
                        gsap.to(subPanel, { autoAlpha: 1, y: 0, duration: 0.5, delay: 0.1 });
                    } else {
                        gsap.set(subPanel, { autoAlpha: 0, y: 20 }); // Oculta los demás sub-paneles
                    }
                });
            }
        });
    }

    // Inicializar el estado de todos los paneles y sub-paneles
    gsap.set(detailSection, { top: '100%', autoAlpha: 0 }); // Oculta la sección principal

    detailPanels.forEach(panel => {
        gsap.set(panel, { autoAlpha: 0, y: 20 }); // Oculta los paneles principales

        const panelId = panel.id;
        currentSubPanelIndex[panelId] = 0; // Inicializa el índice del sub-carrusel a 0 para cada panel

        // Oculta todos los sub-paneles al inicio
        panel.querySelectorAll('.sub-panel').forEach(subPanel => {
            gsap.set(subPanel, { autoAlpha: 0, y: 20 });
        });
    });

    // Animación de las columnas al pasar el cursor (sin cambios)
    columnItems.forEach(item => {
        const image = item.querySelector('img');
        const text = item.querySelector('.column-text');

        gsap.set(image, { scale: 1 });
        gsap.set(text, { opacity: 1, y: 0 });

        item.addEventListener('mouseenter', () => {
            gsap.to(image, { scale: 1.15, duration: 0.5, ease: "power2.out" });
            gsap.to(text, { opacity: 0, y: -20, duration: 0.3, ease: "power2.out" });
            gsap.to(item, { boxShadow: "0 15px 40px rgba(0, 0, 0, 0.2)", duration: 0.3 });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(image, { scale: 1, duration: 0.5, ease: "power2.out" });
            gsap.to(text, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" });
            gsap.to(item, { boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)", duration: 0.3 });
        });

        // Lógica al hacer clic en la columna principal
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target-id'); // Obtiene el ID del panel principal
            const targetPanel = document.getElementById(targetId);

            // Reinicia y oculta todos los paneles principales antes de animar el nuevo
            detailPanels.forEach(panel => {
                gsap.set(panel, { autoAlpha: 0, y: 20 });
                // Asegura que los sub-carruseles estén en la posición inicial al ocultar
                gsap.set(panel.querySelector('.sub-carousel-inner'), { x: 0 });
                // Restablece los sub-paneles internos también
                panel.querySelectorAll('.sub-panel').forEach(subPanel => {
                    gsap.set(subPanel, { autoAlpha: 0, y: 20 });
                });
                currentSubPanelIndex[panel.id] = 0; // Reinicia el índice del sub-carrusel
            });


            // Anima la sección detallada para que se deslice hacia arriba
            gsap.to(detailSection, {
                top: '0%',
                autoAlpha: 1,
                duration: 0.8,
                ease: "power3.out",
                onComplete: () => {
                    if (targetPanel) {
                        gsap.to(targetPanel, {
                            autoAlpha: 1,
                            y: 0,
                            duration: 0.5,
                            onComplete: () => {
                                // Una vez que el panel principal es visible, muestra el primer sub-panel
                                showSubPanel(targetId, 0); // Siempre muestra el primer sub-panel (índice 0)
                            }
                        });
                    } else {
                        console.warn("Error: Panel de detalle no encontrado para el ID:", targetId);
                    }
                }
            });

            document.body.style.overflow = 'hidden';
        });
    });

    // Lógica para las flechas de navegación de cada sub-carrusel
    document.querySelectorAll('.sub-left-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            const panelId = arrow.getAttribute('data-panel-id');
            showSubPanel(panelId, currentSubPanelIndex[panelId] - 1);
        });
    });

    document.querySelectorAll('.sub-right-arrow').forEach(arrow => {
        arrow.addEventListener('click', () => {
            const panelId = arrow.getAttribute('data-panel-id');
            showSubPanel(panelId, currentSubPanelIndex[panelId] + 1);
        });
    });


    // Lógica para cerrar la sección detallada
    closeButton.addEventListener('click', () => {
        // Oculta todos los paneles principales
        detailPanels.forEach(panel => {
            gsap.set(panel, { autoAlpha: 0, y: 20 });
            // Reinicia los sub-carruseles a su posición inicial al cerrar
            gsap.set(panel.querySelector('.sub-carousel-inner'), { x: 0 });
            // Oculta también los sub-paneles internos
            panel.querySelectorAll('.sub-panel').forEach(subPanel => {
                gsap.set(subPanel, { autoAlpha: 0, y: 20 });
            });
            currentSubPanelIndex[panel.id] = 0; // Reinicia el índice al cerrar
        });

        // Anima la sección detallada para que se deslice hacia abajo y luego se oculte
        gsap.to(detailSection, {
            top: '100%',
            autoAlpha: 0,
            duration: 0.8,
            ease: "power3.out",
        });
        document.body.style.overflow = 'auto';
    });
});
const audioPlayer = document.getElementById('audioPlayer');
    const playButtons = document.querySelectorAll('.play-button');
    let currentPlayingButton = null; // Para rastrear qué botón está reproduciendo actualmente

    playButtons.forEach(button => {
        button.addEventListener('click', () => {
            const songSrc = button.getAttribute('data-src');
            const playIcon = button.querySelector('.fas'); // Asumimos que usas Font Awesome para el icono

            // Si se hace clic en el mismo botón que ya está reproduciendo, pausar.
            if (audioPlayer.src === window.location.origin + '/' + songSrc && !audioPlayer.paused) {
                audioPlayer.pause();
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
                currentPlayingButton = null;
            } else {
                // Si hay otra canción reproduciéndose, pausarla y cambiar su icono
                if (currentPlayingButton && currentPlayingButton !== button) {
                    const prevPlayIcon = currentPlayingButton.querySelector('.fas');
                    if (prevPlayIcon) {
                        prevPlayIcon.classList.remove('fa-pause');
                        prevPlayIcon.classList.add('fa-play');
                    }
                    audioPlayer.pause(); // Pausa la canción anterior
                }

                // Cargar y reproducir la nueva canción
                audioPlayer.src = songSrc;
                audioPlayer.play()
                    .then(() => {
                        // Cambiar icono a pausa
                        playIcon.classList.remove('fa-play');
                        playIcon.classList.add('fa-pause');
                        currentPlayingButton = button;
                    })
                    .catch(error => {
                        console.error('Error al reproducir el audio:', error);
                        alert('No se pudo reproducir la canción. Asegúrate de que la ruta sea correcta y el archivo exista.');
                    });
            }
        });
    });

    // Opcional: Manejar el evento 'ended' para resetear el botón cuando la canción termina
    audioPlayer.addEventListener('ended', () => {
        if (currentPlayingButton) {
            const playIcon = currentPlayingButton.querySelector('.fas');
            if (playIcon) {
                playIcon.classList.remove('fa-pause');
                playIcon.classList.add('fa-play');
            }
            currentPlayingButton = null;
        }
    });

    // Opcional: Manejar el evento 'pause' para cambiar el icono si se pausa manualmente
    audioPlayer.addEventListener('pause', () => {
        if (currentPlayingButton && audioPlayer.currentTime > 0 && !audioPlayer.ended) { // Solo si no ha terminado y no es un inicio de pausa
             const playIcon = currentPlayingButton.querySelector('.fas');
             if (playIcon) {
                 playIcon.classList.remove('fa-pause');
                 playIcon.classList.add('fa-play');
             }
        }
    });
