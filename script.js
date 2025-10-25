// Theme toggle functionality
const themeToggle = document.getElementById('theme-switch');
const body = document.body;

themeToggle.addEventListener('change', () => {
    body.classList.toggle('dark');
});

// Style selection
const styleOptions = document.querySelectorAll('.style-option');
let selectedStyle = 'realistic';

styleOptions.forEach(option => {
    option.addEventListener('click', () => {
        styleOptions.forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        selectedStyle = option.dataset.style;
    });
});

// Form submission
document.getElementById('image-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const prompt = document.getElementById('prompt').value.trim();
    const width = document.getElementById('width').value;
    const height = document.getElementById('height').value;
    const count = parseInt(document.getElementById('count').value);
    
    if (!prompt) {
        alert('Please enter a prompt for your image!');
        return;
    }

    // Show loading
    document.getElementById('loading').classList.add('active');
    document.getElementById('generate-btn').disabled = true;
    document.getElementById('results').classList.remove('active');

    try {
        const images = [];
        
        for (let i = 0; i < count; i++) {
            const enhancedPrompt = `${prompt}, ${selectedStyle} style, high quality, detailed, professional`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 10000)}`;
            
            images.push({
                url: imageUrl,
                prompt: enhancedPrompt,
                style: selectedStyle,
                dimensions: `${width}x${height}`
            });

            // Small delay between requests
            if (i < count - 1) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        displayResults(images);

    } catch (error) {
        console.error('Error generating images:', error);
        alert('Error generating images. Please try again.');
    } finally {
        // Delay hiding the loading animation for a smoother transition
        setTimeout(() => {
            document.getElementById('loading').classList.remove('active');
            document.getElementById('generate-btn').disabled = false;
        }, 7500);
    }
});

// Display results
function displayResults(images) {
    const imageGrid = document.getElementById('image-grid');
    imageGrid.innerHTML = '';

    let loadedCount = 0;
    const totalImages = images.length;

    images.forEach((image, index) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'image-card';
        imageCard.innerHTML = `
            <img src="${image.url}" alt="Generated Image ${index + 1}" class="generated-image" onerror="this.src='https://via.placeholder.com/${image.dimensions}?text=Image+Failed+to+Load'; this.alt='Failed to load image';">
            <div class="image-info">
                <strong>Style:</strong> ${image.style}<br>
                <strong>Size:</strong> ${image.dimensions}
            </div>
            <div class="image-actions">
                <button class="action-btn download-btn" onclick="downloadImage('${image.url}', 'ai-image-${index + 1}.jpg')">
                    📥 Download
                </button>
                <button class="action-btn copy-btn" onclick="copyImageUrl('${image.url}')">
                    📋 Copy URL
                </button>
            </div>
        `;

        // Add load event listener to track when images are loaded
        const imgElement = imageCard.querySelector('img');
        imgElement.onload = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                document.getElementById('results').classList.add('active');
                document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
            }
        };
        imgElement.onerror = () => {
            loadedCount++;
            if (loadedCount === totalImages) {
                document.getElementById('results').classList.add('active');
                document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
            }
        };

        imageGrid.appendChild(imageCard);
    });
}

// Download image
async function downloadImage(url, filename) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. You can right-click the image and save it manually.');
    }
}

// Copy image URL
function copyImageUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        // Create temporary feedback
        const feedback = document.createElement('div');
        feedback.textContent = 'URL copied to clipboard!';
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 255, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            z-index: 10000;
            animation: fadeInOut 3s ease;
        `;
        
        document.body.appendChild(feedback);
        setTimeout(() => document.body.removeChild(feedback), 3000);
    }).catch(() => {
        alert('Failed to copy URL to clipboard.');
    });
}

// Add CSS for feedback animation and loader gradient
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20%, 80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
    }

    /* SVG Gradient for Loader */
    .circular-loader {
        stroke: url(#loaderGradient);
    }

    #loaderGradient stop:nth-child(1) {
        stop-color: #4facfe;
    }

    #loaderGradient stop:nth-child(2) {
        stop-color: #00f2fe;
    }
`;
document.head.appendChild(style);

// Add SVG gradient definition for loader
const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svgDefs.setAttribute('width', '0');
svgDefs.setAttribute('height', '0');
svgDefs.innerHTML = `
    <defs>
        <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"/>
            <stop offset="100%"/>
        </linearGradient>
    </defs>
`;
document.body.appendChild(svgDefs);

// Add some example prompts for inspiration
const examplePrompts = [
    "A magical forest with glowing mushrooms and fairy lights, fantasy art",
    "Futuristic city skyline at night with neon lights, cyberpunk style",
    "Majestic mountain landscape with aurora borealis, realistic photography",
    "Cute anime girl with cat ears in a flower garden, anime style",
    "Abstract geometric patterns in vibrant colors, digital art",
    "Steampunk airship flying through clouds, detailed illustration"
];

// Add click listener to prompt textarea for suggestions
document.getElementById('prompt').addEventListener('focus', function() {
    if (this.value === '') {
        const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
        this.placeholder = `Try: "${randomPrompt}"`;
    }
});

// Initialize some floating animations
document.addEventListener('DOMContentLoaded', () => {
    // Add more visual flair
    const header = document.querySelector('header');
    header.addEventListener('mousemove', (e) => {
        const rect = header.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        header.style.background = `
            radial-gradient(circle at ${x}% ${y}%, 
            rgba(255,255,255,0.2) 0%, 
            rgba(255,255,255,0.1) 50%, 
            rgba(255,255,255,0.05) 100%), 
            rgba(255, 255, 255, 0.1)
        `;
    });
});