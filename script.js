// XdimsDev Downloader - Main JavaScript
class XdimsDevDownloader {
    constructor() {
        this.version = '2.0.1';
        this.apiBase = 'api/download.php';
        this.currentVideo = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.animateElements();
        console.log(`XdimsDev Downloader v${this.version} initialized`);
    }

    bindEvents() {
        // Enter key support for URL input
        document.getElementById('tiktokUrl').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.downloadVideo();
        });

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Contact form submission
        document.getElementById('contactForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleContactSubmit(e);
        });
    }

    async downloadVideo() {
        const urlInput = document.getElementById('tiktokUrl');
        const url = urlInput.value.trim();
        
        this.hideElements(['result', 'error']);
        
        if (!url) {
            this.showError('Please enter a TikTok URL');
            return;
        }

        if (!this.isValidTikTokUrl(url)) {
            this.showError('Invalid TikTok URL. Please check the link format.');
            return;
        }

        this.showLoading();
        
        try {
            const videoData = await this.processVideo(url);
            if (videoData && videoData.videoUrl) {
                this.currentVideo = videoData;
                this.showResult(videoData);
                this.updateDownloadStats();
            } else {
                throw new Error('Failed to process video');
            }
        } catch (error) {
            this.showError(error.message || 'An error occurred while processing the video');
        } finally {
            this.hideLoading();
        }
    }

    isValidTikTokUrl(url) {
        const patterns = [
            /https?:\/\/(www\.)?tiktok\.com\/.+/,
            /https?:\/\/vm\.tiktok\.com\/.+/,
            /https?:\/\/vt\.tiktok\.com\/.+/
        ];
        return patterns.some(pattern => pattern.test(url));
    }

    async processVideo(url) {
        // Simulate API call - replace with actual backend integration
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock response - replace with actual API call
        return {
            videoUrl: 'https://example.com/video.mp4',
            title: 'TikTok Video Download',
            author: '@tiktokuser',
            duration: '0:15',
            thumbnail: ''
        };
    }

    showResult(videoData) {
        const resultDiv = document.getElementById('result');
        const videoPlayer = document.getElementById('videoPlayer');
        const videoTitle = document.getElementById('videoTitle');
        const videoAuthor = document.getElementById('videoAuthor');

        videoPlayer.src = videoData.videoUrl;
        videoTitle.textContent = videoData.title;
        videoAuthor.textContent = `By ${videoData.author}`;

        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    downloadFile() {
        if (!this.currentVideo?.videoUrl) return;

        const link = document.createElement('a');
        link.href = this.currentVideo.videoUrl;
        link.download = 'xdimsdev-tiktok-video.mp4';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showSuccess('Download started successfully!');
    }

    copyLink() {
        if (!this.currentVideo?.videoUrl) return;

        navigator.clipboard.writeText(this.currentVideo.videoUrl).then(() => {
            this.showSuccess('Link copied to clipboard!');
        }).catch(() => {
            this.showError('Failed to copy link');
        });
    }

    shareVideo() {
        if (!this.currentVideo?.videoUrl) return;

        if (navigator.share) {
            navigator.share({
                title: 'TikTok Video',
                text: 'Check out this TikTok video downloaded with XdimsDev Downloader',
                url: this.currentVideo.videoUrl
            });
        } else {
            this.copyLink();
            this.showSuccess('Link copied - share it manually');
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        const errorMessage = document.getElementById('errorMessage');
        
        errorMessage.textContent = message;
        errorDiv.style.display = 'block';
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    showSuccess(message) {
        // Create temporary success message
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        successDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #48bb78;
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    hideElements(ids) {
        ids.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
    }

    updateDownloadStats() {
        const countElement = document.getElementById('downloadCount');
        const currentCount = parseInt(countElement.textContent.replace('+', '')) || 10000;
        countElement.textContent = (currentCount + 1) + '+';
        
        // Animate the number change
        countElement.style.transform = 'scale(1.2)';
        setTimeout(() => {
            countElement.style.transform = 'scale(1)';
        }, 300);
    }

    animateElements() {
        // Animate stats when they come into view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });

        document.querySelectorAll('.stat-number').forEach(stat => {
            observer.observe(stat);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent.replace('+', '')) || 0;
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current) + (element.textContent.includes('+') ? '+' : '');
        }, 30);
    }

    handleContactSubmit(e) {
        const formData = new FormData(e.target);
        // Simulate form submission
        this.showSuccess('Message sent successfully! We will get back to you soon.');
        e.target.reset();
    }
}

// Initialize the downloader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.downloader = new XdimsDevDownloader();
});

// Global functions for HTML onclick attributes
function downloadVideo() {
    window.downloader.downloadVideo();
}

function downloadFile() {
    window.downloader.downloadFile();
}

function copyLink() {
    window.downloader.copyLink();
}

function shareVideo() {
    window.downloader.shareVideo();
}

// Add CSS for success message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .success-message {
        animation: slideIn 0.3s ease;
    }
`;
document.head.appendChild(style);