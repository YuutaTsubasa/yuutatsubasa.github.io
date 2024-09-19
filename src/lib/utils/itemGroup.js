export class ItemGroup {
    constructor(title, content, items) {
        this.title = title;
        this.content = content;
        this.items = items.map(item => this.parseItem(item));
        this.currentIndex = 0;
        this.slideDirection = 1;
    }

    parseItem(item) {
        if (typeof item === 'string') {
            if (item.includes('youtube.com') || item.includes('youtu.be')) {
                return { type: 'youtube', url: this.getYoutubeEmbedUrl(item) };
            }
            return { type: 'image', url: item };
        }
        return item;
    }

    getYoutubeEmbedUrl(url) {
        const videoId = this.getYoutubeVideoId(url);
        return `https://www.youtube.com/embed/${videoId}`;
    }

    getYoutubeVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
    next() {
        this.slideDirection = 1;
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
    }

    previous() {
        this.slideDirection = -1;
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    }

    currentItem() {
        return this.items[this.currentIndex];
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getSlideDirection() {
        return this.slideDirection;
    }
}