document.addEventListener('DOMContentLoaded', function() {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const colorPalette = document.getElementById('colorPalette');

    const previewSection = document.querySelector('.preview-section');
    const pickedColorPreview = document.querySelector('.picked-color-preview');
    const hexCode = document.querySelector('.hex-code span');
    const rgbCode = document.querySelector('.rgb-code span');
    const copyBtn = document.querySelector('.copy-btn');
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    document.body.appendChild(notification);

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                extractColors(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    });

    function extractColors(imageSrc) {
        const img = new Image();
        img.src = imageSrc;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            const colorMap = new Map();

            // Sample pixels at regular intervals
            for (let i = 0; i < imageData.length; i += 4) {
                const r = imageData[i];
                const g = imageData[i + 1];
                const b = imageData[i + 2];
                const rgb = `rgb(${r},${g},${b})`;
                colorMap.set(rgb, (colorMap.get(rgb) || 0) + 1);
            }

            // Sort colors by frequency and get top 8
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 8)
                .map(entry => entry[0]);

            displayColors(sortedColors);
        };
    }

    function displayColors(colors) {
        colorPalette.innerHTML = '';
        colors.forEach(color => {
            const colorBox = document.createElement('div');
            colorBox.className = 'color-box';
            colorBox.style.backgroundColor = color;
            colorBox.innerHTML = `<span>${color}</span>`;
            
            colorBox.addEventListener('click', () => {
                navigator.clipboard.writeText(color);
                showNotification('Color code copied to clipboard!');
            });
            
            colorPalette.appendChild(colorBox);
        });
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.classList.add('show');
        setTimeout(() => {
            notification.classList.remove('show');
        }, 2000);
    }


     // Create magnifier
     const magnifier = document.createElement('div');
     magnifier.className = 'magnifier';
     previewSection.appendChild(magnifier);
 
     // Function to convert RGB to HEX
     function rgbToHex(r, g, b) {
         return '#' + [r, g, b].map(x => {
             const hex = x.toString(16);
             return hex.length === 1 ? '0' + hex : hex;
         }).join('');
     }
 
     // Function to get color at specific point
     function getColorAtPoint(x, y, canvas, ctx) {
         const pixel = ctx.getImageData(x, y, 1, 1).data;
         const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
         const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
         return { rgb, hex };
     }
 
     imagePreview.addEventListener('load', function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = this.naturalWidth;
        canvas.height = this.naturalHeight;
        ctx.drawImage(this, 0, 0);

        const magnifier = document.querySelector('.magnifier');
        const previewWrapper = document.querySelector('.preview-wrapper');

        previewWrapper.addEventListener('mousemove', function(e) {
            if (!imagePreview.style.display || imagePreview.style.display === 'none') return;

            const rect = imagePreview.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
                magnifier.style.display = 'block';
                magnifier.style.left = (x - 75) + 'px';
                magnifier.style.top = (y - 75) + 'px';

                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                
                const zoomLevel = 2;
                magnifier.style.backgroundImage = `url(${imagePreview.src})`;
                magnifier.style.backgroundPosition = `${-x * zoomLevel + 75}px ${-y * zoomLevel + 75}px`;
                magnifier.style.backgroundSize = `${rect.width * zoomLevel}px ${rect.height * zoomLevel}px`;

                // Get color at point
                const canvasX = Math.min(Math.max(0, Math.floor(x * scaleX)), canvas.width - 1);
                const canvasY = Math.min(Math.max(0, Math.floor(y * scaleY)), canvas.height - 1);
                const pixel = ctx.getImageData(canvasX, canvasY, 1, 1).data;
                const color = {
                    rgb: `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`,
                    hex: rgbToHex(pixel[0], pixel[1], pixel[2])
                };
                
                updateColorInfo(color);
            } else {
                magnifier.style.display = 'none';
            }
        });

        previewWrapper.addEventListener('mouseleave', function() {
            magnifier.style.display = 'none';
        });
    });
 
     function updateColorInfo(color) {
         pickedColorPreview.style.backgroundColor = color.rgb;
         hexCode.textContent = color.hex.toUpperCase();
         rgbCode.textContent = color.rgb;
     }
 
     copyBtn.addEventListener('click', function() {
         const colorToCopy = `HEX: ${hexCode.textContent}\nRGB: ${rgbCode.textContent}`;
         navigator.clipboard.writeText(colorToCopy);
         showNotification('Color codes copied to clipboard!');
     });

    
});