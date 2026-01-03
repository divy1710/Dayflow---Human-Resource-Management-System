# Profile Picture Upload Feature

## Overview

The profile picture upload feature allows employees and admins to upload and update their profile pictures. Images are stored on Cloudinary with automatic optimization and transformation.

## Features

- ✅ Direct file upload from profile page
- ✅ Image validation (type and size)
- ✅ Automatic image optimization via Cloudinary
- ✅ Face-centered cropping (500x500px)
- ✅ Camera icon overlay on avatar
- ✅ Real-time preview after upload
- ✅ 5MB file size limit
- ✅ Supports: JPEG, JPG, PNG, GIF, WEBP

## Backend Implementation

### Files Created/Modified

1. **`backend/src/lib/cloudinary.ts`** - Cloudinary configuration
2. **`backend/src/middleware/upload.middleware.ts`** - Multer file upload middleware
3. **`backend/src/controllers/profile.controller.ts`** - Profile picture upload handler
4. **`backend/src/routes/profile.routes.ts`** - Added multer middleware to route

### API Endpoint

```
POST /api/profile/picture
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body:
- profilePicture: File (image file)

Response:
{
  "status": "success",
  "data": {
    "profile": { ...profileData },
    "imageUrl": "https://res.cloudinary.com/..."
  }
}
```

### Cloudinary Configuration

The image upload includes automatic transformations:

- **Crop**: Fill mode with face detection gravity
- **Dimensions**: 500x500 pixels
- **Quality**: Auto optimization
- **Folder**: `dayflow/profiles`

## Frontend Implementation

### Files Modified

1. **`frontend/src/pages/profile/ProfilePage.tsx`** - Added upload UI and handlers
2. **`frontend/src/pages/profile/Profile.css`** - Added camera button styling
3. **`frontend/src/services/profile.service.ts`** - Already had uploadProfilePicture method

### UI Components

- Camera icon button overlaid on avatar (bottom-right corner)
- File input (hidden, triggered by camera button)
- Upload state with disabled button during upload
- Success/error alerts

### Validation

- File type must be image/\* (JPEG, PNG, GIF, WEBP)
- Maximum file size: 5MB
- User-friendly error messages

## Environment Variables

### Required in `.env`

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Getting Cloudinary Credentials

1. Sign up at https://cloudinary.com
2. Go to Dashboard/Console
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env` file

## User Experience

### For Employees

1. Navigate to Profile page
2. Click camera icon on avatar
3. Select image file
4. Image uploads automatically
5. Avatar updates with new picture
6. Success notification appears

### For Admins

- Same functionality as employees
- Can upload/update profile picture from their own profile

## Security

- ✅ Authentication required (JWT token)
- ✅ File type validation (images only)
- ✅ File size validation (5MB limit)
- ✅ Memory storage (no local disk writes)
- ✅ Cloudinary handles image processing securely

## Error Handling

- Invalid file type → "Please upload an image file"
- File too large → "Image size should be less than 5MB"
- Network error → "Failed to upload profile picture"
- No Cloudinary config → Server error with 500 status

## Testing Checklist

- [ ] Upload JPEG image
- [ ] Upload PNG image
- [ ] Try uploading non-image file (should fail)
- [ ] Try uploading >5MB file (should fail)
- [ ] Verify image appears in Cloudinary dashboard
- [ ] Verify profile updates with new image URL
- [ ] Test as Employee role
- [ ] Test as Admin role
- [ ] Check responsive design on mobile

## Future Enhancements

- [ ] Image cropper before upload
- [ ] Multiple image format support
- [ ] Drag-and-drop upload
- [ ] Remove/delete profile picture option
- [ ] Upload progress indicator
- [ ] Image compression before upload
