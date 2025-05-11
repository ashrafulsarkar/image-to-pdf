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
        
        // Add images to the list
        imageFiles.forEach(file => addImageToList(file));
        
        // Show the image preview container if it's the first image
        if (selectedImages.length > 0 && !imagePreviewContainer.style.display) {
            imagePreviewContainer.style.display = 'block';
        }
        
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
        
        // Create image preview
        const reader = new FileReader();
        reader.onload = (e) => {
            // Create image element
            const img = document.createElement('img');
            img.src = e.target.result;
            img.className = 'image-preview';
            img.alt = file.name;
            
            // Create image name element
            const imageName = document.createElement('div');
            imageName.className = 'image-name';
            imageName.textContent = file.name;
            
            // Create remove button
            const removeButton = document.createElement('div');
            removeButton.className = 'remove-image';
            removeButton.innerHTML = '<i class="fas fa-times"></i>';
            removeButton.addEventListener('click', () => removeImage(imageId));
            
            // Append elements to image item
            imageItem.appendChild(img);
            imageItem.appendChild(imageName);
            imageItem.appendChild(removeButton);
            
            // Add to image list
            imageList.appendChild(imageItem);
            
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
    
    // Remove image from list
    function removeImage(imageId) {
        // Remove from DOM
        const imageElement = document.getElementById(imageId);
        if (imageElement) {
            imageElement.remove();
        }
        
        // Remove from array
        const index = selectedImages.findIndex(img => img.id === imageId);
        if (index !== -1) {
            selectedImages.splice(index, 1);
        }
        
        // Disable convert button if no images
        convertBtn.disabled = selectedImages.length === 0;
        
        // Hide image preview container if no images
        if (selectedImages.length === 0) {
            imagePreviewContainer.style.display = 'none';
        }
    }
    
    // Remove all images
    function removeAllImages() {
        if (selectedImages.length === 0) return;
        
        // Clear the image list
        imageList.innerHTML = '';
        
        // Clear the array
        selectedImages.length = 0;
        
        // Disable convert button
        convertBtn.disabled = true;
        
        // Hide image preview container
        imagePreviewContainer.style.display = 'none';
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
            
            // Hide progress after a delay
            setTimeout(() => {
                progressContainer.style.display = 'none';
            }, 3000);
        }
        
        // Start processing
        addImageToPDF();
    }
}); 