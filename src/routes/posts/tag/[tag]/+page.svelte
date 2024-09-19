<script>
import { browser } from '$app/environment';
    
if (browser) { 
    window.location.href = `/posts/tag/${encodeURIComponent(tag)}/1`;
}
</script>