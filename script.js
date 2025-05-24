// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const imageList = document.getElementById('image-list');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const addMoreBtn = document.getElementById('add-more-btn');
    const removeAllBtn = document.getElementById('remove-all-btn');
    const convertBtn = document.getElementById('convert-btn');
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress');
    const progressText = document.getElementById('progress-text');
    const qualitySlider = document.getElementById('quality-slider');
    const qualityValue = document.getElementById('quality-value');
    const pageSizeSelect = document.getElementById('page-size');
    const orientationSelect = document.getElementById('orientation');
    
    // Store selected images
    const selectedImages = [];
    
    // Set up event listeners
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    addMoreBtn.addEventListener('click', () => fileInput.click());
    removeAllBtn.addEventListener('click', removeAllImages);
    convertBtn.addEventListener('click', convertToPDF);
    qualitySlider.addEventListener('input', updateQualityValue);
    
    // Initialize quality value display
    updateQualityValue();

    // Drag and drop handlers
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('active');
    }
    
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('active');
        
        const files = e.dataTransfer.files;
        processFiles(files);
    }
    
    // File selection handler
    function handleFileSelect(e) {
        const files = e.target.files;
        processFiles(files);
        fileInput.value = '';  // Reset file input
    }
    
    // Process selected files
    function processFiles(files) {
        if (!files || files.length === 0) return;
        
        // Filter for image files
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Please select valid image files.');
            return;
        }
        
        // Show the image preview container with animation
        if (!imagePreviewContainer.classList.contains('active')) {
            imagePreviewContainer.style.display = 'block';
            // Trigger reflow
            imagePreviewContainer.offsetHeight;
            imagePreviewContainer.classList.add('active');
        }
        
        // Add images to the list with staggered animation
        imageFiles.forEach((file, index) => {
            setTimeout(() => addImageToList(file), index * 100);
        });
        
        // Enable convert button if we have images
        convertBtn.disabled = selectedImages.length === 0;
    }
    
    // Add image to the list
    function addImageToList(file) {
        // Create a unique ID for this image
        const imageId = 'img_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // Create image item element
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.id = imageId;
        imageItem.style.opacity = '0';
        imageItem.style.transform = 'scale(0.8)';
        
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create image wrapper
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'image-wrapper';
            
            // Create image element
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'image-preview';
            img.alt = file.name;
            
            // Create image name element
            const imageName = document.createElement('div');
            imageName.className = 'image-name';
            imageName.textContent = file.name;
            
            // Create remove button with icon
            const removeButton = document.createElement('button');
            removeButton.className = 'remove-image';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                removeImage(imageId);
            });
            
            // Append elements
            imageItem.appendChild(img);
            imageItem.appendChild(imageName);
            imageItem.appendChild(removeButton);
            
            // Add to image list with animation
            imageList.appendChild(imageItem);
            
            // Trigger animation
            setTimeout(() => {
                imageItem.style.transition = 'all 0.3s ease-out';
                imageItem.style.opacity = '1';
                imageItem.style.transform = 'scale(1)';
            }, 50);
            
            // Add to selected images array
            selectedImages.push({
                id: imageId,
                file: file,
                dataUrl: e.target.result
            });
            
            // Enable convert button
            convertBtn.disabled = false;
        };
        
        reader.readAsDataURL(file);
    }
    
    // Remove image with animation
    function removeImage(imageId) {
        const imageElement = document.getElementById(imageId);
        if (imageElement) {
            // Animate removal
            imageElement.style.opacity = '0';
            imageElement.style.transform = 'scale(0.8)';
            
            setTimeout(() => {
                imageElement.remove();
                
                // Remove from array
                const index = selectedImages.findIndex(img => img.id === imageId);
                if (index !== -1) {
                    selectedImages.splice(index, 1);
                }
                
                // Disable convert button if no images
                convertBtn.disabled = selectedImages.length === 0;
                
                // Hide image preview container if no images
                if (selectedImages.length === 0) {
                    imagePreviewContainer.classList.remove('active');
                    setTimeout(() => {
                        imagePreviewContainer.style.display = 'none';
                    }, 300);
                }
            }, 300);
        }
    }
    
    // Remove all images with animation
    function removeAllImages() {
        if (selectedImages.length === 0) return;
        
        // Animate all images
        const items = imageList.querySelectorAll('.image-item');
        items.forEach((item, index) => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
            }, index * 50);
        });
        
        // Clear after animations
        setTimeout(() => {
            imageList.innerHTML = '';
            selectedImages.length = 0;
            convertBtn.disabled = true;
            
            // Hide container with animation
            imagePreviewContainer.classList.remove('active');
            setTimeout(() => {
                imagePreviewContainer.style.display = 'none';
            }, 300);
        }, items.length * 50 + 300);
    }
    
    // Update quality value display
    function updateQualityValue() {
        const quality = qualitySlider.value;
        qualityValue.textContent = `${Math.round(quality * 100)}%`;
    }
    
    // Convert images to PDF
    function convertToPDF() {
        if (selectedImages.length === 0) return;
        
        // Show progress container
        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = 'Preparing images...';
        
        // Get PDF settings
        const pageSize = pageSizeSelect.value;
        const orientation = orientationSelect.value;
        const quality = parseFloat(qualitySlider.value);
        
        // Create a new jsPDF instance
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: pageSize
        });
        
        // PDF page dimensions (in mm)
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Process images one by one
        let currentImage = 0;
        
        // Function to add image to PDF
        function addImageToPDF() {
            if (currentImage >= selectedImages.length) {
                // All images processed, save the PDF
                finalizePDF();
                return;
            }
            
            const img = selectedImages[currentImage];
            
            // Update progress
            const progress = ((currentImage + 1) / selectedImages.length) * 100;
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `Converting image ${currentImage + 1} of ${selectedImages.length}...`;
            
            // Create a new image object
            const imgObj = new Image();
            imgObj.src = img.dataUrl;
            
            imgObj.onload = function() {
                try {
                    // Calculate dimensions to fit the page while maintaining aspect ratio
                    let imgWidth = imgObj.width;
                    let imgHeight = imgObj.height;
                    
                    // Convert from pixels to mm
                    const pxToMm = 0.264583;
                    imgWidth = imgWidth * pxToMm;
                    imgHeight = imgHeight * pxToMm;
                    
                    // Scale to fit page
                    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
                    imgWidth *= ratio;
                    imgHeight *= ratio;
                    
                    // Calculate position to center the image
                    const x = (pageWidth - imgWidth) / 2;
                    const y = (pageHeight - imgHeight) / 2;
                    
                    // Add a new page for each image except the first one
                    if (currentImage > 0) {
                        pdf.addPage(pageSize, orientation);
                    }
                    
                    // Add image to PDF
                    pdf.addImage(
                        img.dataUrl,
                        'JPEG',
                        x,
                        y,
                        imgWidth,
                        imgHeight,
                        undefined,
                        'FAST',
                        0
                    );
                    
                    // Process next image
                    currentImage++;
                    setTimeout(addImageToPDF, 100);
                } catch (error) {
                    console.error('Error adding image to PDF:', error);
                    progressText.textContent = 'Error: ' + error.message;
                }
            };
            
            imgObj.onerror = function() {
                console.error('Error loading image');
                progressText.textContent = 'Error loading image';
                currentImage++;
                setTimeout(addImageToPDF, 100);
            };
        }
          // Function to finalize and save the PDF
        function finalizePDF() {
            // Update progress
            progressBar.style.width = '100%';
            progressText.textContent = 'PDF created successfully!';
            
            // Generate filename based on current date and time
            const now = new Date();
            const filename = `images_to_pdf_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}.pdf`;
            
            // Save the PDF
            pdf.save(filename);
            
            // Remove all images after successful PDF creation
            setTimeout(() => {
                removeAllImages();
                progressContainer.style.display = 'none';
            }, 1500);
        }
        
        // Start processing
        addImageToPDF();
    }
});