
# 3D Avatar Models for LifePath

This directory contains 3D models for the avatar system used in the LifePath educational app.

## Required Models

For the avatar system to work properly, add a model file named `stylized-avatar.glb` to this directory.

## Model Requirements

The model should:

1. Be in GLB format (glTF Binary)
2. Be optimized for web use (ideally under 5MB)
3. Include facial morph targets/shape keys for expressions
4. Be rigged for animation
5. Include the following morph targets for facial expressions:
   - smileLeft
   - smileRight
   - frownLeft
   - frownRight
   - eyebrowsRaised
   - eyebrowsDown
   - mouthOpen
   - mouthTight
   - eyesClosed
   - eyesWide

## Animation Requirements

The model should include the following animations:
1. Idle - A looping idle animation with subtle movements
2. Wave - A friendly wave gesture
3. Clapping - Applause animation
4. ThumbsUp - A thumbs up gesture
5. Shrug - A shoulder shrug with confused expression
6. Pointing - Pointing animation
7. CrossArms - Arms crossed posture
8. Facepalm - A facepalm gesture
9. Nodding - Head nodding animation

## Recommended Sources

You can create custom avatars using:
1. Ready Player Me - https://readyplayer.me/
2. Mixamo for animations - https://www.mixamo.com/
3. Blender for customization - https://www.blender.org/

## For Development Testing

For initial development, you can use any of these options:
1. Use free CC0/MIT-licensed models from Sketchfab
2. Create a simple avatar with ReadyPlayerMe
3. Use placeholder models from:
   - Google Poly Archive
   - Kenney Game Assets
   - Sketchfab free models

Remember to check licensing before using any models in production.
