
# Firebase Setup Notes

## Applying Firestore Rules

1. Navigate to the [Firebase Console](https://console.firebase.google.com)
2. Select your "LifePath" project
3. Click on "Firestore Database" in the left sidebar
4. Select the "Rules" tab
5. Replace the existing rules with the content from the `firebase.rules` file
6. Click "Publish" to apply the rules

## Understanding the Rules

These rules provide:
- Protection for user data (users can only access/modify their own data)
- Ability for teachers to create and manage classrooms
- Ability for students to join classrooms (by adding themselves to the students array)
- Permissions for students to vote in classroom activities

## Potential Issues

If you experience permissions issues when joining classrooms, check that:
1. The user is properly authenticated
2. The classroom actually exists (via correct class code)
3. The joining operation is properly updating the students array

## Debugging

When testing Firebase rules, use the Firebase Console's "Rules Playground" to simulate operations and check if they would be allowed or denied according to your rules.
