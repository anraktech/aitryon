(function() {
  'use strict';

  // Configuration
  const WEBHOOK_URL = 'https://n8n.srv920226.hstgr.cloud/webhook/gemini-image-gen';
  
  // Error messages for homepage
  const HOMEPAGE_ERROR_MESSAGES = [
    { title: "Oops!", message: "Our AI stylist is taking a creative break. Please try again!" },
    { title: "Sorry!", message: "The fashion transformation chamber needs a moment to reboot." },
    { title: "Hmm...", message: "Looks like our style algorithms are having a dance party. Try again?" },
    { title: "Oh no!", message: "The personalization engine hiccupped. Let's give it another go!" }
  ];

  // Compliments for successful results
  const COMPLIMENT_MESSAGES = [
    { main: "You look absolutely stunning!", sub: "This style was made for you" },
    { main: "Wow, you're gorgeous in this!", sub: "This look is absolutely perfect on you" },
    { main: "You look amazing!", sub: "This outfit brings out your natural beauty" },
    { main: "Stunning choice!", sub: "You have incredible style sense" },
    { main: "You're glowing!", sub: "This look is so you" },
    { main: "Absolutely beautiful!", sub: "You make this outfit shine" },
    { main: "You look radiant!", sub: "This style complements you perfectly" }
  ];

  // State management
  let currentState = 'upload';
  let userPhotoData = null;
  let productImages = [];

  // DOM Elements
  const elements = {
    modal: null,
    trigger: null,
    closeBtn: null,
    uploadSection: null,
    previewSection: null,
    loadingSection: null,
    resultSection: null,
    errorSection: null,
    uploadPhotoBtn: null,
    useCameraBtn: null,
    photoInput: null,
    cameraInput: null,
    userPhotoPreview: null,
    changePhotoBtn: null,
    generateBtn: null,
    generatedImage: null,
    exploreBtn: null,
    errorTitle: null,
    errorMessage: null,
    retryBtn: null
  };

  // Initialize with multiple fallbacks for robust loading
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Additional fallback for Shopify theme loading
  window.addEventListener('load', function() {
    if (!elements.modal || !elements.trigger) {
      console.log('Retrying initialization after window load...');
      setTimeout(init, 500);
    }
  });

  function init() {
    // Cache DOM elements
    cacheElements();
    
    // Setup event listeners
    setupEventListeners();
    
    // Collect all product images on the page
    collectProductImages();
  }

  function cacheElements() {
    // Detect page type and cache appropriate elements
    const isProductPage = window.location.pathname.includes('/products/');
    
    if (isProductPage) {
      // Product page elements
      elements.modal = document.getElementById('ai-tryon-modal');
      elements.trigger = document.getElementById('ai-tryon-product-trigger');
      elements.closeBtn = elements.modal?.querySelector('.ai-modal-close');
      
      // Sections
      elements.uploadSection = document.getElementById('upload-section');
      elements.previewSection = document.getElementById('preview-section');
      elements.loadingSection = document.getElementById('loading-section');
      elements.resultSection = document.getElementById('result-section');
      elements.errorSection = document.getElementById('error-section');
      
      // Upload elements
      elements.uploadPhotoBtn = document.getElementById('upload-photo-btn');
      elements.useCameraBtn = document.getElementById('use-camera-btn');
      elements.photoInput = document.getElementById('photo-input');
      elements.cameraInput = document.getElementById('camera-input');
      
      // Preview elements
      elements.userPhotoPreview = document.getElementById('user-photo-preview');
      elements.changePhotoBtn = document.getElementById('change-photo-btn');
      elements.generateBtn = document.getElementById('generate-btn');
      
      // Result elements
      elements.generatedImage = document.getElementById('generated-image');
      elements.exploreBtn = document.getElementById('add-to-cart-btn'); // Different on product page
      
      // Error elements
      elements.errorTitle = document.getElementById('error-title');
      elements.errorMessage = document.getElementById('error-message');
      elements.retryBtn = document.getElementById('retry-btn');
    } else {
      // Homepage elements
      elements.modal = document.getElementById('ai-homepage-modal');
      elements.trigger = document.getElementById('ai-homepage-trigger');
      elements.closeBtn = elements.modal?.querySelector('.ai-modal-close');
      
      // Sections
      elements.uploadSection = document.getElementById('homepage-upload-section');
      elements.previewSection = document.getElementById('homepage-preview-section');
      elements.loadingSection = document.getElementById('homepage-loading-section');
      elements.resultSection = document.getElementById('homepage-result-section');
      elements.errorSection = document.getElementById('homepage-error-section');
      
      // Upload elements
      elements.uploadPhotoBtn = document.getElementById('homepage-upload-photo-btn');
      elements.useCameraBtn = document.getElementById('homepage-use-camera-btn');
      elements.photoInput = document.getElementById('homepage-photo-input');
      elements.cameraInput = document.getElementById('homepage-camera-input');
      
      // Preview elements
      elements.userPhotoPreview = document.getElementById('homepage-user-photo-preview');
      elements.changePhotoBtn = document.getElementById('homepage-change-photo-btn');
      elements.generateBtn = document.getElementById('homepage-generate-btn');
      
      // Result elements
      elements.exploreBtn = document.getElementById('homepage-explore-btn');
      
      // Error elements
      elements.errorTitle = document.getElementById('homepage-error-title');
      elements.errorMessage = document.getElementById('homepage-error-message');
      elements.retryBtn = document.getElementById('homepage-retry-btn');
    }
    
    console.log('Page type:', isProductPage ? 'Product' : 'Homepage');
    console.log('Modal found:', !!elements.modal);
    console.log('Trigger found:', !!elements.trigger);
  }

  function setupEventListeners() {
    // Modal triggers
    elements.trigger?.addEventListener('click', openModal);
    elements.closeBtn?.addEventListener('click', closeModal);
    elements.modal?.addEventListener('click', function(e) {
      if (e.target === elements.modal || e.target.classList.contains('ai-modal-overlay')) {
        closeModal();
      }
    });

    // Upload buttons
    elements.uploadPhotoBtn?.addEventListener('click', () => elements.photoInput.click());
    elements.useCameraBtn?.addEventListener('click', handleCameraClick);
    
    // File inputs
    elements.photoInput?.addEventListener('change', handleFileSelect);
    elements.cameraInput?.addEventListener('change', handleFileSelect);
    
    // Action buttons
    elements.changePhotoBtn?.addEventListener('click', () => setState('upload'));
    elements.generateBtn?.addEventListener('click', personalizeSite);
    elements.exploreBtn?.addEventListener('click', handleAddToCart);
    elements.retryBtn?.addEventListener('click', () => {
      userPhotoData = null;
      if (elements.photoInput) elements.photoInput.value = '';
      if (elements.cameraInput) elements.cameraInput.value = '';
      setState('upload');
    });
  }

  function collectProductImages() {
    // For product pages, get the main product image
    const isProductPage = window.location.pathname.includes('/products/');
    
    productImages = [];
    
    if (isProductPage) {
      // Product page - get main product image
      const productSelectors = [
        'img[src*="cdn.shopify.com"]',
        '.product-single__photo img',
        '.product__photo img', 
        '.product-image-main img',
        '.product-form__cart-submit img',
        '.product img',
        'img[alt*="product" i]',
        'img[data-product-image]',
        '.featured-image img',
        '.product-featured-image img'
      ];
      
      // Try each selector until we find images
      for (const selector of productSelectors) {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
          if (img.src && img.src.includes('shopify') && !productImages.some(p => p.src === img.src)) {
            productImages.push({
              element: img,
              originalSrc: img.src,
              src: img.src
            });
          }
        });
        
        // If we found images, break
        if (productImages.length > 0) break;
      }
      
      // Fallback: get any image on the page
      if (productImages.length === 0) {
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
          if (img.src && 
              (img.src.includes('shopify') || img.src.includes('product')) && 
              img.offsetWidth > 100 && img.offsetHeight > 100) {
            productImages.push({
              element: img,
              originalSrc: img.src,
              src: img.src
            });
          }
        });
      }
    } else {
      // Homepage - collect product images from collection
      const productSelectors = [
        '.product-item img',
        '.grid-product__image img',
        '.product-card img',
        '.collection-item img',
        'img[src*="product"]',
        'img[src*="shopify"]'
      ];
      
      productSelectors.forEach(selector => {
        const images = document.querySelectorAll(selector);
        images.forEach(img => {
          if (img.src && !productImages.some(p => p.src === img.src)) {
            productImages.push({
              element: img,
              originalSrc: img.src,
              src: img.src
            });
          }
        });
      });
    }
    
    console.log(`Found ${productImages.length} product images to personalize`);
    console.log('Product images:', productImages.map(p => p.src));
  }

  function openModal() {
    if (!elements.modal) {
      console.error('Modal element not found');
      return;
    }
    
    // Move modal to body to ensure it's not constrained by parent containers
    if (elements.modal.parentElement !== document.body) {
      document.body.appendChild(elements.modal);
    }
    
    // Initialize product image in preview
    const productImagePreview = document.getElementById('product-image-preview');
    if (productImagePreview) {
      // Try multiple selectors to find product image
      const productImg = document.querySelector('img[src*="cdn.shopify.com"], .product img, [data-product-image] img, img[alt*="product"]') ||
                        document.querySelector('img[src*=".jpg"], img[src*=".png"], img[src*=".webp"]');
      
      if (productImg && productImg.src) {
        productImagePreview.src = productImg.src;
        console.log('Product image set:', productImg.src);
      } else {
        console.log('No product image found');
      }
    }
    
    elements.modal.classList.add('ai-modal-open');
    document.body.style.overflow = 'hidden';
    setState('upload');
    
    console.log('Modal opened successfully');
  }

  function closeModal() {
    if (!elements.modal) return;
    elements.modal.classList.remove('ai-modal-open');
    document.body.style.overflow = '';
    resetState();
  }

  async function handleAddToCart() {
    const isProductPage = window.location.pathname.includes('/products/');
    
    if (isProductPage) {
      try {
        // Get product info from container
        const container = document.querySelector('.ai-tryon-container');
        if (!container) {
          console.error('Product container not found');
          return;
        }
        
        const productId = container.getAttribute('data-product-id');
        if (!productId) {
          console.error('Product ID not found');
          return;
        }
        
        // Change button text to show loading
        const button = elements.exploreBtn;
        const originalText = button.textContent;
        button.textContent = 'Adding...';
        button.disabled = true;
        
        // Get the first available variant ID from the page
        let variantId = null;
        
        // Try to find variant ID from form or page data
        const variantInput = document.querySelector('input[name="id"]');
        const variantSelect = document.querySelector('select[name="id"]');
        const productForm = document.querySelector('form[action*="/cart/add"]');
        
        if (variantInput && variantInput.value) {
          variantId = variantInput.value;
        } else if (variantSelect && variantSelect.value) {
          variantId = variantSelect.value;
        } else if (productForm) {
          // Try to find any variant input in the form
          const formVariantInput = productForm.querySelector('input[name="id"], select[name="id"]');
          if (formVariantInput) {
            variantId = formVariantInput.value;
          }
        }
        
        // Fallback: try to get first variant from page data
        if (!variantId && window.ShopifyAnalytics && window.ShopifyAnalytics.meta && window.ShopifyAnalytics.meta.product) {
          const variants = window.ShopifyAnalytics.meta.product.variants;
          if (variants && variants.length > 0) {
            variantId = variants[0].id;
          }
        }
        
        // Final fallback: use product ID (might work for single variant products)
        if (!variantId) {
          variantId = productId;
          console.warn('Using product ID as variant ID - this might not work for multi-variant products');
        }
        
        console.log('Using variant ID:', variantId);
        
        // Add to cart using Shopify's Ajax API
        const formData = {
          items: [{
            id: variantId,
            quantity: 1
          }]
        };
        
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          // Success - show feedback and close modal
          button.textContent = 'Added!';
          
          setTimeout(() => {
            closeModal();
            // Try to trigger cart drawer if available, otherwise redirect
            if (window.Shopify && window.Shopify.onCartUpdate) {
              window.Shopify.onCartUpdate();
            } else if (typeof window.cartDrawerToggle === 'function') {
              window.cartDrawerToggle();
            } else {
              window.location.href = '/cart';
            }
          }, 1000);
        } else {
          // Try alternative method: submit form directly
          console.log('Cart API failed, trying form submission');
          const productForm = document.querySelector('form[action*="/cart/add"]');
          if (productForm) {
            // Clone the form and submit it
            const formData = new FormData();
            formData.append('id', variantId);
            formData.append('quantity', '1');
            
            fetch('/cart/add', {
              method: 'POST',
              body: formData
            }).then(response => {
              if (response.ok) {
                button.textContent = 'Added!';
                setTimeout(() => {
                  closeModal();
                  window.location.href = '/cart';
                }, 1000);
              } else {
                button.textContent = originalText;
                button.disabled = false;
                console.error('Both add to cart methods failed');
              }
            });
          } else {
            // Error - reset button
            button.textContent = originalText;
            button.disabled = false;
            console.error('Failed to add to cart - no form found');
          }
        }
        
      } catch (error) {
        console.error('Add to cart error:', error);
        // Reset button on error
        if (elements.exploreBtn) {
          elements.exploreBtn.textContent = 'Add to Cart';
          elements.exploreBtn.disabled = false;
        }
      }
    } else {
      // Homepage - just close modal
      closeModal();
    }
  }

  function setState(state) {
    currentState = state;
    
    // Hide all sections with safe checks
    if (elements.uploadSection) elements.uploadSection.style.display = 'none';
    if (elements.previewSection) elements.previewSection.style.display = 'none';
    if (elements.loadingSection) elements.loadingSection.style.display = 'none';
    if (elements.resultSection) elements.resultSection.style.display = 'none';
    if (elements.errorSection) elements.errorSection.style.display = 'none';
    
    // Show current state
    switch(state) {
      case 'upload':
        if (elements.uploadSection) elements.uploadSection.style.display = 'block';
        break;
      case 'preview':
        if (elements.previewSection) elements.previewSection.style.display = 'block';
        break;
      case 'loading':
        if (elements.loadingSection) elements.loadingSection.style.display = 'block';
        break;
      case 'result':
        if (elements.resultSection) elements.resultSection.style.display = 'block';
        break;
      case 'error':
        if (elements.errorSection) elements.errorSection.style.display = 'block';
        break;
    }
    
    console.log(`State set to: ${state}`);
  }

  async function handleCameraClick() {
    try {
      // Check if camera is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to file input with camera capture
        elements.cameraInput.click();
        return;
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user', // Front-facing camera
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });

      // Create camera modal/interface
      showCameraInterface(stream);

    } catch (error) {
      console.error('Camera access error:', error);
      
      if (error.name === 'NotAllowedError') {
        showError('Camera access denied. Please allow camera permissions and try again.');
      } else if (error.name === 'NotFoundError') {
        showError('No camera found. Please use the upload option instead.');
      } else {
        // Fallback to file input with camera capture
        elements.cameraInput.click();
      }
    }
  }

  function showCameraInterface(stream) {
    // Create camera interface elements
    const cameraContainer = document.createElement('div');
    cameraContainer.className = 'ai-camera-container';
    cameraContainer.innerHTML = `
      <div class="ai-camera-preview">
        <video id="camera-video" autoplay muted playsinline></video>
        <canvas id="camera-canvas" style="display: none;"></canvas>
      </div>
      <div class="ai-camera-controls">
        <button class="ai-camera-btn ai-cancel-camera" id="cancel-camera">Cancel</button>
        <button class="ai-camera-btn ai-capture-btn" id="capture-photo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Capture
        </button>
        <button class="ai-camera-btn ai-switch-camera" id="switch-camera" style="display: none;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
          </svg>
        </button>
      </div>
    `;

    // Replace upload section with camera interface
    elements.uploadSection.style.display = 'none';
    elements.modal.querySelector('.ai-modal-body').appendChild(cameraContainer);

    // Setup video stream
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const captureBtn = document.getElementById('capture-photo');
    const cancelBtn = document.getElementById('cancel-camera');
    const switchBtn = document.getElementById('switch-camera');

    video.srcObject = stream;
    
    let currentFacingMode = 'user';
    let currentStream = stream;

    // Capture photo
    captureBtn.addEventListener('click', () => {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);
      
      // Convert to blob and handle as uploaded file
      canvas.toBlob((blob) => {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        
        // Create fake event and process the image
        const fakeEvent = { target: { files: [file] } };
        handleFileSelect(fakeEvent);
        
        // Cleanup
        stopCameraStream(currentStream);
        cameraContainer.remove();
        elements.uploadSection.style.display = 'block';
      }, 'image/jpeg', 0.9);
    });

    // Cancel camera
    cancelBtn.addEventListener('click', () => {
      stopCameraStream(currentStream);
      cameraContainer.remove();
      elements.uploadSection.style.display = 'block';
    });

    // Switch camera (front/back)
    if (navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        if (videoDevices.length > 1) {
          switchBtn.style.display = 'block';
          switchBtn.addEventListener('click', async () => {
            try {
              stopCameraStream(currentStream);
              currentFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
              
              const newStream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                  facingMode: currentFacingMode,
                  width: { ideal: 640 },
                  height: { ideal: 480 }
                } 
              });
              
              video.srcObject = newStream;
              currentStream = newStream;
            } catch (error) {
              console.error('Camera switch error:', error);
            }
          });
        }
      });
    }
  }

  function stopCameraStream(stream) {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  }

  // Compress image to reduce payload size
  function compressImage(base64String, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to compressed base64
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        console.log(`Image compressed: ${Math.round(base64String.length / 1024)}KB -> ${Math.round(compressedBase64.length / 1024)}KB`);
        resolve(compressedBase64);
      };
      
      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = base64String;
    });
  }

  async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
      showError("Please select a valid image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        // Compress the image before storing
        const compressedImage = await compressImage(e.target.result, 800, 0.7);
        userPhotoData = compressedImage;
        elements.userPhotoPreview.src = compressedImage;
        
        // Set product image in preview
        const productImagePreview = document.getElementById('product-image-preview');
        if (productImagePreview) {
          // Get the product image from the page
          const productImageOnPage = document.querySelector('.product-image img, .product img, img[src*="product"], [data-product-image]');
          if (productImageOnPage && productImageOnPage.src) {
            productImagePreview.src = productImageOnPage.src;
          } else {
            // Fallback: get from data attribute
            const container = document.querySelector('[data-product-image]');
            if (container) {
              productImagePreview.src = container.getAttribute('data-product-image');
            }
          }
        }
        
        setState('preview');
      } catch (error) {
        console.error('Error compressing image:', error);
        showError("Failed to process image. Please try another photo.");
      }
    };
    reader.readAsDataURL(file);
  }

  async function personalizeSite() {
    if (!userPhotoData) {
      showError("Please select a photo first");
      return;
    }

    if (productImages.length === 0) {
      showError("No products found to personalize");
      return;
    }

    const isProductPage = window.location.pathname.includes('/products/');
    setState('loading');
    
    // Copy images to loading animation
    const loadingUserPhoto = document.getElementById('loading-user-photo');
    const loadingProductPhoto = document.getElementById('loading-product-photo');
    const userPhotoPreview = elements.userPhotoPreview;
    const productImagePreview = document.getElementById('product-image-preview');
    
    if (loadingUserPhoto && userPhotoPreview && userPhotoPreview.src) {
      loadingUserPhoto.src = userPhotoPreview.src;
    }
    
    if (loadingProductPhoto && productImagePreview && productImagePreview.src) {
      loadingProductPhoto.src = productImagePreview.src;
    }

    try {
      // Get OpenRouter API key from theme settings
      const apiKey = getOpenRouterKey();
      
      let successCount = 0;
      let failureCount = 0;

      // Process images based on page type
      const imagesToProcess = isProductPage ? 1 : Math.min(productImages.length, 20); // Product page: 1 image, Homepage: up to 20
      for (let i = 0; i < imagesToProcess; i++) {
        try {
          const productImage = productImages[i];
          console.log(`Processing product image ${i + 1}/${productImages.length}: ${productImage.src}`);
          
          // Prepare webhook payload with URL for product image
          const payload = {
            userPhoto: userPhotoData, // Compressed base64 image
            productImageUrl: productImage.src, // Send as URL instead of base64
            apiKey: apiKey
          };

          // Call webhook
          const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          });

          if (response.ok) {
            const result = await response.json();
            console.log('Webhook response received:', result);
            
            // Debug: Log the exact structure
            console.log('Response has images array?', !!result.images);
            console.log('Images array length:', result.images ? result.images.length : 0);
            if (result.images && result.images.length > 0) {
              console.log('First image object:', result.images[0]);
              console.log('Has image_url?', !!result.images[0].image_url);
              console.log('Has url in image_url?', result.images[0].image_url ? !!result.images[0].image_url.url : false);
            }
            
            // Try different response formats
            let imageDataUrl = null;
            
            // Format 1: OpenRouter format with nested structure
            if (result.choices && result.choices.length > 0 && result.choices[0].message && result.choices[0].message.images) {
              const images = result.choices[0].message.images;
              if (images.length > 0 && images[0].image_url && images[0].image_url.url) {
                imageDataUrl = images[0].image_url.url;
                console.log('Found image in choices[0].message.images format');
              }
            }
            // Format 2: Direct images array
            else if (result.images && result.images.length > 0) {
              if (result.images[0].image_url && result.images[0].image_url.url) {
                imageDataUrl = result.images[0].image_url.url;
                console.log('Found image in direct images array format');
              } else if (typeof result.images[0] === 'string') {
                imageDataUrl = result.images[0];
                console.log('Found image as string in images array');
              }
            }
            // Format 3: Legacy format
            else if (result.image) {
              imageDataUrl = `data:image/jpeg;base64,${result.image}`;
              console.log('Found image in legacy format');
            }
            
            if (imageDataUrl) {
              console.log('Generated image received');
              if (isProductPage) {
                // Product page: show in modal
                if (elements.generatedImage) {
                  elements.generatedImage.src = imageDataUrl;
                  console.log('Updated generated image in modal');
                } else {
                  console.error('Generated image element not found');
                }
              } else {
                // Homepage: replace product image on page
                productImage.element.src = imageDataUrl;
                console.log('Updated product image on page');
              }
              successCount++;
            } else {
              console.error('No image found in response. Full response:', JSON.stringify(result));
              failureCount++;
            }
          } else {
            console.error('Webhook request failed:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            failureCount++;
          }
          
          // Small delay between requests to avoid overwhelming the API
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (error) {
          console.error(`Error processing product image ${i + 1}:`, error);
          failureCount++;
        }
      }

      // Track analytics
      console.log(`Processing completed: ${successCount} successes, ${failureCount} failures`);
      if (successCount > 0) {
        console.log('Setting state to result (success)');
        const analyticsEvent = isProductPage ? 'product_success' : 'homepage_success';
        trackAnalytics(analyticsEvent, successCount);
        
        // Show random compliment for product pages
        if (isProductPage) {
          const randomCompliment = COMPLIMENT_MESSAGES[Math.floor(Math.random() * COMPLIMENT_MESSAGES.length)];
          const complimentElement = document.getElementById('compliment-text');
          if (complimentElement) complimentElement.textContent = randomCompliment.main;
        }
        
        // Show success
        setState('result');
      } else {
        console.log('Setting state to error (no successes)');
        const analyticsEvent = isProductPage ? 'product_failure' : 'homepage_failure';
        trackAnalytics(analyticsEvent, failureCount);
        showRandomError();
      }
      
    } catch (error) {
      console.error('Personalization error:', error);
      showRandomError();
      trackAnalytics('homepage_failure', 1);
    }
  }

  function showRandomError() {
    const error = HOMEPAGE_ERROR_MESSAGES[Math.floor(Math.random() * HOMEPAGE_ERROR_MESSAGES.length)];
    elements.errorTitle.textContent = error.title;
    elements.errorMessage.textContent = error.message;
    setState('error');
  }

  function showError(message) {
    elements.errorTitle.textContent = "Error";
    elements.errorMessage.textContent = message;
    setState('error');
  }

  function resetState() {
    currentState = 'upload';
    userPhotoData = null;
    if (elements.photoInput) elements.photoInput.value = '';
    if (elements.cameraInput) elements.cameraInput.value = '';
  }

  async function imageUrlToBase64(url) {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const fullDataUrl = reader.result; // Keep full data:image/jpeg;base64,xxx format
          resolve(fullDataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw error;
    }
  }

  function getOpenRouterKey() {
    // Get API key from theme extension settings
    const container = document.querySelector('.ai-tryon-container') || document.querySelector('.ai-homepage-container');
    const apiKey = container?.dataset.apiKey;
    
    console.log('API Key retrieved from theme settings:', apiKey ? 'Found' : 'Not found');
    
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('OpenRouter API key not configured. Please add it in the theme customizer settings.');
    }
    
    return apiKey;
  }

  function trackAnalytics(type, count = 1) {
    // Analytics removed to avoid 404 errors
    // Can be re-enabled when proper API endpoints are set up
    console.log('Analytics:', type, count);
  }

})();