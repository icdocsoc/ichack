---
created: 2024-07-15
authors:
  - Harini
---
<details>
<summary> 15th July 2024 </summary>
Working on Login Page
Created layouts/ and pages/ directories; adding in a template for the login screen without functionality
</details>
<details>
<summary> 17th July 2024 </summary>
Added in a dummy route for auth/login (server-side)
Implemented the login function, which sends a POST request when the login button is pressed
</details>
<details>
<summary> 18th July 2024 </summary>
Added simple input validation to check that email and password follow the correct structure
</details>
<details>
<summary> 22nd July 2024 </summary>
Made some requested changes from the pull request
</details>
<summary> 23nd July 2024 </summary>
Installed TailwindCSS and refactored code to make use of custom CSS classes (for better readability)
Restored response checking (was removed by mistake)
</details>
<details>
<summary> 25th/26th July 2024 </summary>
Was facing Windows related issues so migrated over to use WSL
Inlined TailwindCSS instead of defining the classes in an external CSS file
Updated proxyUrl in base-layer to be an environment variable
Updated README for admin app; to include commands used for local development
</details>
<details>
<summary> 27th July 2024 </summary>
Merged into main after making small requested changes
</details>
<details>
<summary> 29th July 2024</summary>
Working on Dependency Inversion
Abstracted out the current behaviour that FE needs from the server into an interface (ClientServer) and then instantiated this as a class called ServerImpl that does the communication with the server. In the FE, the loginUser function is called via an instance of the ServerImpl class.
</details>
<details>
<summary> 1st/2nd August 2024 </summary>
Worked on implementing the repository pattern (See [[Repository Pattern]]). Our current implementation uses Hono and can be found in the HonoAuthRepo class. Added HonoAuthRepo as a plugin, allowing it to be used globally throughout the application. Updated shared types to add new type (User Credentials). Aliases have been added, and these should be imported through the base layer and can be used throughout the application for neater imports.
</details>
<details>
<summary> 6th - 8th August 2024 </summary>
Worked on setting up Pinia and using it in the project to store user state. Have created a user store in which all of the required fields (as of yet) are stored and update this with the response returned from the login request. loginUser now returns a Result<'UserState,Error'> and each case is dealt with in the FE. Having a fixed return type allows for easy maintenance in the future
</details>