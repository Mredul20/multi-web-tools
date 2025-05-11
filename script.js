<<<<<<< HEAD
// Image Resizer Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only run this code on the image resizer page
    if (!document.querySelector('.resize-settings')) return;

    const uploadBtn = document.querySelector('.upload-btn');
    const widthInput = document.querySelector('.dimension-group:nth-child(3) input');
    const heightInput = document.querySelector('.dimension-group:nth-child(4) input');
    const lockAspectCheckbox = document.getElementById('lockAspect');
    const exportBtn = document.querySelector('.export-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const imageGrid = document.getElementById('imageGrid');
    let aspectRatio = 1; // Default aspect ratio
    
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show different preset sizes based on tab
            if (button.textContent === 'As Percentage') {
                widthInput.value = '100';
                heightInput.value = '100';
                document.querySelectorAll('.unit-selector').forEach(select => {
                    select.innerHTML = '<option>%</option>';
                });
            } else if (button.textContent === 'Social Media') {
                widthInput.value = '1200';
                heightInput.value = '630';
                document.querySelectorAll('.unit-selector').forEach(select => {
                    select.innerHTML = '<option>px</option>';
                });
                // Show commonly used social media dimensions
                const socialSizes = [
                    { name: 'Facebook Post', width: 1200, height: 630 },
                    { name: 'Instagram Post', width: 1080, height: 1080 },
                    { name: 'Twitter Post', width: 1200, height: 675 },
                    { name: 'LinkedIn Post', width: 1200, height: 627 }
                ];
                
                // Could add code to display these presets
            } else {
                // By Size
                widthInput.value = '800';
                heightInput.value = '800';
                document.querySelectorAll('.unit-selector').forEach(select => {
                    select.innerHTML = '<option>px</option>';
                });
            }
            
            // Update preview sizes if images are already loaded
            updatePreviewSizes();
        });
    });
    
    // Handle file upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle drag and drop
    uploadBtn.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBtn.style.borderColor = '#3498db';
        uploadBtn.style.backgroundColor = '#ebf5ff';
    });
    
    uploadBtn.addEventListener('dragleave', () => {
        uploadBtn.style.borderColor = '#cbd5e0';
        uploadBtn.style.backgroundColor = '#f8fafc';
    });
    
    uploadBtn.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBtn.style.borderColor = '#cbd5e0';
        uploadBtn.style.backgroundColor = '#f8fafc';
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);
        }
    });
    
    // Maintain aspect ratio when width or height changes
    widthInput.addEventListener('input', () => {
        if (lockAspectCheckbox.checked && aspectRatio !== 0) {
            const newWidth = parseInt(widthInput.value) || 0;
            heightInput.value = Math.round(newWidth / aspectRatio);
            updatePreviewSizes();
        }
    });
    
    heightInput.addEventListener('input', () => {
        if (lockAspectCheckbox.checked && aspectRatio !== 0) {
            const newHeight = parseInt(heightInput.value) || 0;
            widthInput.value = Math.round(newHeight * aspectRatio);
            updatePreviewSizes();
        }
    });
    
    // Toggle export settings visibility
    const exportSettingsHeader = document.querySelector('.export-settings h3');
    const exportSettingsContent = document.querySelectorAll('.export-input');
    
    exportSettingsHeader.addEventListener('click', () => {
        const isVisible = exportSettingsContent[0].style.display !== 'none';
        exportSettingsContent.forEach(item => {
            item.style.display = isVisible ? 'none' : 'block';
        });
        exportSettingsHeader.querySelector('span').textContent = isVisible ? '▶' : '▼';
    });
    
    // Handle file processing
    function handleFiles(files) {
        if (files.length === 0) return;
        
        imageGrid.innerHTML = ''; // Clear existing images
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Calculate aspect ratio from the original image
                    aspectRatio = img.width / img.height;
                    
                    if (lockAspectCheckbox.checked && index === 0) {
                        // Update height based on current width value and first image's aspect ratio
                        const newWidth = parseInt(widthInput.value) || 800;
                        heightInput.value = Math.round(newWidth / aspectRatio);
                    }
                    
                    // Create image card
                    const card = document.createElement('div');
                    card.className = 'image-card';
                    
                    // Truncated filename for display
                    const fileNameParts = file.name.split('.');
                    const extension = fileNameParts.pop();
                    const baseName = fileNameParts.join('.');
                    const truncatedName = baseName.length > 15 ? 
                        `${baseName.substring(0, 12)}...` : baseName;
                    const displayName = `${truncatedName}.${extension}`;
                    
                    // Calculate file size in KB
                    const fileSizeKB = Math.round(file.size / 1024);
                    const fileSizeText = fileSizeKB > 1024 ? 
                        `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;
                    
                    card.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <div class="image-actions">
                            <button class="image-action view-image" title="View original">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <button class="image-action crop-image" title="Crop">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
                            </button>
                            <button class="image-action remove-image" title="Remove">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div class="image-details">
                            <div class="image-name" title="${file.name}">${displayName}</div>
                            <div class="image-size">
                                <span>${img.width}×${img.height} (${fileSizeText})</span>
                                <span class="size-arrow">→</span>
                                <span class="size-btn">${widthInput.value}×${heightInput.value}</span>
                            </div>
                        </div>
                    `;
                    
                    imageGrid.appendChild(card);
                    
                    // Add event listeners to action buttons
                    const viewBtn = card.querySelector('.view-image');
                    viewBtn.addEventListener('click', () => {
                        // Open image in new tab/modal
                        const imgUrl = e.target.result;
                        window.open(imgUrl, '_blank');
                    });
                    
                    const cropBtn = card.querySelector('.crop-image');
                    cropBtn.addEventListener('click', () => {
                        // Could implement crop functionality or show message
                        alert('Crop functionality would be implemented here');
                    });
                    
                    const removeBtn = card.querySelector('.remove-image');
                    removeBtn.addEventListener('click', () => {
                        card.remove();
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Function to update preview sizes when dimensions change
    function updatePreviewSizes() {
        const newWidth = widthInput.value;
        const newHeight = heightInput.value;
        const sizeButtons = document.querySelectorAll('.size-btn');
        
        sizeButtons.forEach(btn => {
            btn.textContent = `${newWidth}×${newHeight}`;
        });
    }
    
    // Export button functionality
    exportBtn.addEventListener('click', () => {
        const imageCards = document.querySelectorAll('.image-card');
        if (imageCards.length === 0) {
            alert('Please upload at least one image to resize');
            return;
        }
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        if (width <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }
        
        // Get format selection
        const formatSelect = document.querySelector('.export-input:last-child select');
        const format = formatSelect.options[formatSelect.selectedIndex].text.toLowerCase();
        
        // Simulate processing with a message
        const originalBtnText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<span>Processing...</span>';
        
        setTimeout(() => {
            // Perform actual image resizing
            processImages(imageCards, width, height, format);
            
            // Restore button text
            exportBtn.innerHTML = originalBtnText;
        }, 1000);
    });
    
    // Function to process and download images
    function processImages(imageCards, width, height, format) {
        let processed = 0;
        
        imageCards.forEach((card, index) => {
            const img = card.querySelector('img');
            const filename = card.querySelector('.image-name').title;
            
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Draw image on canvas (resized)
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get the format mime type
            let mimeType;
            if (format === 'jpg' || format === 'jpeg' || format === 'original' && filename.toLowerCase().endsWith('jpg')) {
                mimeType = 'image/jpeg';
            } else if (format === 'png' || format === 'original' && filename.toLowerCase().endsWith('png')) {
                mimeType = 'image/png';
            } else if (format === 'webp' || format === 'original' && filename.toLowerCase().endsWith('webp')) {
                mimeType = 'image/webp';
            } else {
                mimeType = 'image/jpeg'; // Default
            }
            
            // Convert to blob and download
            canvas.toBlob(function(blob) {
                // Create download link
                const link = document.createElement('a');
                link.download = `resized_${index+1}_${filename}`;
                link.href = URL.createObjectURL(blob);
                link.click();
                
                // Clean up
                URL.revokeObjectURL(link.href);
                processed++;
                
                // Show completion message when all images are processed
                if (processed === imageCards.length) {
                    alert(`Successfully processed ${processed} image${processed > 1 ? 's' : ''}!`);
                }
            }, mimeType, 0.92); // Quality parameter for JPEG
        });
    }
});
=======
// Image Resizer Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Only run this code on the image resizer page
    if (!document.querySelector('.resize-settings')) return;

    const uploadBtn = document.querySelector('.upload-btn');
    const widthInput = document.querySelector('.dimension-group:nth-child(3) input');
    const heightInput = document.querySelector('.dimension-group:nth-child(4) input');
    const lockAspectCheckbox = document.getElementById('lockAspect');
    const exportBtn = document.querySelector('.export-btn');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const imageGrid = document.getElementById('imageGrid');
    let aspectRatio = 1; // Default aspect ratio
    
    // Create a hidden file input
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.multiple = true;
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show different preset sizes based on tab
            if (button.textContent === 'As Percentage') {
                widthInput.value = '100';
                heightInput.value = '100';
                document.querySelectorAll('.unit-selector').forEach(select => {
                    select.innerHTML = '<option>%</option>';
                });
            } else if (button.textContent === 'Social Media') {
                widthInput.value = '1200';
                heightInput.value = '630';
                document.querySelectorAll('.unit-selector').forEach(select => {
                    select.innerHTML = '<option>px</option>';
                });
                // Show commonly used social media dimensions
                const socialSizes = [
                    { name: 'Facebook Post', width: 1200, height: 630 },
                    { name: 'Instagram Post', width: 1080, height: 1080 },
                    { name: 'Twitter Post', width: 1200, height: 675 },
                    { name: 'LinkedIn Post', width: 1200, height: 627 }
                ];
                
                // Could add code to display these presets
            } else {
                // By Size
                widthInput.value = '800';
                heightInput.value = '800';
                document.querySelectorAll('.unit-selector').forEach(select => {
                    select.innerHTML = '<option>px</option>';
                });
            }
            
            // Update preview sizes if images are already loaded
            updatePreviewSizes();
        });
    });
    
    // Handle file upload button click
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // Handle drag and drop
    uploadBtn.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBtn.style.borderColor = '#3498db';
        uploadBtn.style.backgroundColor = '#ebf5ff';
    });
    
    uploadBtn.addEventListener('dragleave', () => {
        uploadBtn.style.borderColor = '#cbd5e0';
        uploadBtn.style.backgroundColor = '#f8fafc';
    });
    
    uploadBtn.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBtn.style.borderColor = '#cbd5e0';
        uploadBtn.style.backgroundColor = '#f8fafc';
        
        if (e.dataTransfer.files.length) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    // Handle file selection
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFiles(e.target.files);
        }
    });
    
    // Maintain aspect ratio when width or height changes
    widthInput.addEventListener('input', () => {
        if (lockAspectCheckbox.checked && aspectRatio !== 0) {
            const newWidth = parseInt(widthInput.value) || 0;
            heightInput.value = Math.round(newWidth / aspectRatio);
            updatePreviewSizes();
        }
    });
    
    heightInput.addEventListener('input', () => {
        if (lockAspectCheckbox.checked && aspectRatio !== 0) {
            const newHeight = parseInt(heightInput.value) || 0;
            widthInput.value = Math.round(newHeight * aspectRatio);
            updatePreviewSizes();
        }
    });
    
    // Toggle export settings visibility
    const exportSettingsHeader = document.querySelector('.export-settings h3');
    const exportSettingsContent = document.querySelectorAll('.export-input');
    
    exportSettingsHeader.addEventListener('click', () => {
        const isVisible = exportSettingsContent[0].style.display !== 'none';
        exportSettingsContent.forEach(item => {
            item.style.display = isVisible ? 'none' : 'block';
        });
        exportSettingsHeader.querySelector('span').textContent = isVisible ? '▶' : '▼';
    });
    
    // Handle file processing
    function handleFiles(files) {
        if (files.length === 0) return;
        
        imageGrid.innerHTML = ''; // Clear existing images
        
        Array.from(files).forEach((file, index) => {
            if (!file.type.startsWith('image/')) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    // Calculate aspect ratio from the original image
                    aspectRatio = img.width / img.height;
                    
                    if (lockAspectCheckbox.checked && index === 0) {
                        // Update height based on current width value and first image's aspect ratio
                        const newWidth = parseInt(widthInput.value) || 800;
                        heightInput.value = Math.round(newWidth / aspectRatio);
                    }
                    
                    // Create image card
                    const card = document.createElement('div');
                    card.className = 'image-card';
                    
                    // Truncated filename for display
                    const fileNameParts = file.name.split('.');
                    const extension = fileNameParts.pop();
                    const baseName = fileNameParts.join('.');
                    const truncatedName = baseName.length > 15 ? 
                        `${baseName.substring(0, 12)}...` : baseName;
                    const displayName = `${truncatedName}.${extension}`;
                    
                    // Calculate file size in KB
                    const fileSizeKB = Math.round(file.size / 1024);
                    const fileSizeText = fileSizeKB > 1024 ? 
                        `${(fileSizeKB / 1024).toFixed(1)} MB` : `${fileSizeKB} KB`;
                    
                    card.innerHTML = `
                        <img src="${e.target.result}" alt="${file.name}">
                        <div class="image-actions">
                            <button class="image-action view-image" title="View original">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            </button>
                            <button class="image-action crop-image" title="Crop">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14"></path><path d="M18 22V8a2 2 0 0 0-2-2H2"></path></svg>
                            </button>
                            <button class="image-action remove-image" title="Remove">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>
                        <div class="image-details">
                            <div class="image-name" title="${file.name}">${displayName}</div>
                            <div class="image-size">
                                <span>${img.width}×${img.height} (${fileSizeText})</span>
                                <span class="size-arrow">→</span>
                                <span class="size-btn">${widthInput.value}×${heightInput.value}</span>
                            </div>
                        </div>
                    `;
                    
                    imageGrid.appendChild(card);
                    
                    // Add event listeners to action buttons
                    const viewBtn = card.querySelector('.view-image');
                    viewBtn.addEventListener('click', () => {
                        // Open image in new tab/modal
                        const imgUrl = e.target.result;
                        window.open(imgUrl, '_blank');
                    });
                    
                    const cropBtn = card.querySelector('.crop-image');
                    cropBtn.addEventListener('click', () => {
                        // Could implement crop functionality or show message
                        alert('Crop functionality would be implemented here');
                    });
                    
                    const removeBtn = card.querySelector('.remove-image');
                    removeBtn.addEventListener('click', () => {
                        card.remove();
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
    
    // Function to update preview sizes when dimensions change
    function updatePreviewSizes() {
        const newWidth = widthInput.value;
        const newHeight = heightInput.value;
        const sizeButtons = document.querySelectorAll('.size-btn');
        
        sizeButtons.forEach(btn => {
            btn.textContent = `${newWidth}×${newHeight}`;
        });
    }
    
    // Export button functionality
    exportBtn.addEventListener('click', () => {
        const imageCards = document.querySelectorAll('.image-card');
        if (imageCards.length === 0) {
            alert('Please upload at least one image to resize');
            return;
        }
        
        const width = parseInt(widthInput.value);
        const height = parseInt(heightInput.value);
        
        if (width <= 0 || height <= 0) {
            alert('Please enter valid dimensions');
            return;
        }
        
        // Get format selection
        const formatSelect = document.querySelector('.export-input:last-child select');
        const format = formatSelect.options[formatSelect.selectedIndex].text.toLowerCase();
        
        // Simulate processing with a message
        const originalBtnText = exportBtn.innerHTML;
        exportBtn.innerHTML = '<span>Processing...</span>';
        
        setTimeout(() => {
            // Perform actual image resizing
            processImages(imageCards, width, height, format);
            
            // Restore button text
            exportBtn.innerHTML = originalBtnText;
        }, 1000);
    });
    
    // Function to process and download images
    function processImages(imageCards, width, height, format) {
        let processed = 0;
        
        imageCards.forEach((card, index) => {
            const img = card.querySelector('img');
            const filename = card.querySelector('.image-name').title;
            
            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // Draw image on canvas (resized)
            ctx.drawImage(img, 0, 0, width, height);
            
            // Get the format mime type
            let mimeType;
            if (format === 'jpg' || format === 'jpeg' || format === 'original' && filename.toLowerCase().endsWith('jpg')) {
                mimeType = 'image/jpeg';
            } else if (format === 'png' || format === 'original' && filename.toLowerCase().endsWith('png')) {
                mimeType = 'image/png';
            } else if (format === 'webp' || format === 'original' && filename.toLowerCase().endsWith('webp')) {
                mimeType = 'image/webp';
            } else {
                mimeType = 'image/jpeg'; // Default
            }
            
            // Convert to blob and download
            canvas.toBlob(function(blob) {
                // Create download link
                const link = document.createElement('a');
                link.download = `resized_${index+1}_${filename}`;
                link.href = URL.createObjectURL(blob);
                link.click();
                
                // Clean up
                URL.revokeObjectURL(link.href);
                processed++;
                
                // Show completion message when all images are processed
                if (processed === imageCards.length) {
                    alert(`Successfully processed ${processed} image${processed > 1 ? 's' : ''}!`);
                }
            }, mimeType, 0.92); // Quality parameter for JPEG
        });
    }
});
>>>>>>> master
