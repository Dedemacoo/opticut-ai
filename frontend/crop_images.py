from PIL import Image

def crop_center(image_path, output_path, crop_factor):
    try:
        img = Image.open(image_path).convert("RGBA")
        width, height = img.size
        
        # Calculate new dimensions
        new_width = int(width * crop_factor)
        new_height = int(height * crop_factor)
        
        left = (width - new_width) / 2
        top = (height - new_height) / 2
        right = (width + new_width) / 2
        bottom = (height + new_height) / 2
        
        cropped_img = img.crop((left, top, right, bottom))
        
        # Create a mask for rounded corners if desired, or just save as PNG
        cropped_img.save(output_path, "PNG")
        print(f"Successfully cropped {image_path} to {output_path}")
    except Exception as e:
        print(f"Error processing {image_path}: {e}")

# The dark square looks to be about 70-75% of the total image width
# Let's crop it tightly to remove the checkerboard
crop_center("c:/Users/arjin/Desktop/pvc/frontend/public/logo.jpg", "c:/Users/arjin/Desktop/pvc/frontend/public/logo_cropped.png", 0.72)
crop_center("c:/Users/arjin/Desktop/pvc/frontend/src/app/icon.png", "c:/Users/arjin/Desktop/pvc/frontend/src/app/icon.png", 0.72)
