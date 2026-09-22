###### [1] Activity Revision

###### Bugs

- Read modify write can cause race conditions when multiple requests access the file at the same time
- Date.now can potentially generate duplicate IDs when activities are created within the same millisecond
- JSON.parse can throw an error if the activity file contains invalid or corrupted JSON

###### Performance

- readFileSync is synchronous and blocks the Node.js event loop while reading the file
- writeFileSync is synchronous and blocks the Node.js event loop while writing the file
- existsSync is also synchronous and blocks the Node.js event loop
- The entire JSON file is read and parsed for every request
- The entire JSON array is converted to JSON and rewritten to the file whenever a new activity is created
- Using a JSON file as a data store will become inefficient as the number of activities grows

###### Maintainability

- loadDataA and loadDataB contain exactly the same logic and should be replaced with a single loadData function
- The code mixes file storage logic with activity business logic
- CommonJS is valid but using ES Modules could provide a more modern and consistent module system

###### Security

- There is no input validation for action and info
- The API accepts arbitrary values for action and info without checking their type or length
- There is no visible authentication or authorization on the activity routes
- Large info values could cause unnecessary memory usage and large file writes

###### Code Quality

- The code does not use type safety
- The function parameter b does not clearly describe the expected structure of the input
- Error handling around file operations and JSON parsing could be improved
- Using a database such as PostgreSQL would be more appropriate for persistent activity data in a production application

###### Recommended Improvements

- Replace synchronous filesystem APIs with asynchronous fs promises APIs
- Add input validation using Zod or express validator
- Replace loadDataA and loadDataB with one reusable loadData function
- Use crypto randomUUID instead of Date.now for activity IDs
- Add proper error_handling for filesystem operations and JSON parsing
- Add authentication and authorization if activity data is restricted
  Consider using PostgreSQL instead of a JSON file for scalable persistent storage

==================================================================================================================================================================================================================================================================================================================================================================================================================

###### [2] Tasks Revision

###### Bugs

- createTask updateTask and deleteTask use separate read and write operations instead of using updateJsonArray `src/utils/jsonStore.js`
- This can still cause race conditions when multiple requests modify the tasks file concurrently
- Two requests can read the same version of the file and one update can overwrite the other
- updateTask uses object spreading with updates which can allow unexpected properties to be merged into the task object
- updateTask and deleteTask perform a read before writing which can become inconsistent when another request modifies the file between these operations

###### Performance

- Every task creation update or deletion reads the entire JSON file into memory
- Every modification rewrites the entire JSON file
- This approach becomes increasingly expensive as the number of tasks grows
- The application uses an in memory cache which reduces unnecessary filesystem reads
- Asynchronous filesystem operations are used through the shared jsonStore utility which prevents synchronous filesystem operations from blocking the event loop
- For a larger application a database would provide better performance and scalability than repeatedly reading and rewriting a JSON file

###### Maintainability

- Validation logic is duplicated between the controller and service layer
- The title and completed validation rules are implemented in multiple places
- The default value for completed is also handled in both the controller and service
- The controller and service responsibilities could be separated more clearly by moving request validation into a dedicated validation layer
- updateTask should explicitly define which fields are allowed to be updated instead of spreading the entire updates object
- The shared jsonStore utility improves maintainability by centralizing file storage operations

###### Security

- Input validation exists but it is duplicated and could be centralized into a dedicated validation layer
- The update operation should use a whitelist of allowed fields to prevent unexpected properties from being stored
- The application should enforce maximum input lengths for fields such as title to prevent unnecessarily large data from being stored
- Request body size limits should be configured to prevent excessively large payloads
- If task data is protected data the routes should also use authentication and authorization

###### Code Quality

- The service layer contains business logic while the controller handles HTTP specific concerns which is a good separation of responsibilities
- The shared jsonStore utility provides reusable storage functions for different modules
- updateJsonArray should be used for all read modify write operations to ensure the file lock protects the complete operation
- Validation messages are inconsistent between the controller and service
- Some validation logic is duplicated and should be extracted into reusable schemas or validation middleware
- The code uses clear function names and small focused functions which improves readability
- The application would benefit from a consistent error handling and validation strategy across all modules

###### Recommended Improvements

- Replace separate read modify write operations with updateJsonArray
- Centralize request validation using a validation library such as Zod or Joi
- Whitelist fields that are allowed to be updated
- Add maximum length validation for task fields
- Add request body size limits
- Keep HTTP validation concerns in the controller or validation middleware and business logic in the service
- Use a database such as PostgreSQL if the application needs to support larger datasets or higher concurrent traffic

==================================================================================================================================================================================================================================================================================================================================================================================================================

###### Storage Improvement

- To improve the file storage implementation and make it more efficient I extracted the file operations into a reusable storage utility and addressed the issues identified during the code review
- I created a new shared storage utility at `src/utils/jsonStore.js` that can be used across different modules in the application to handle JSON array files
- The main improvements are

- Replaced synchronous filesystem operations with asynchronous `fs/promises` APIs
- Added in memory caching to reduce unnecessary filesystem reads
- Implemented file locking to prevent race conditions during concurrent operations
- Added proper error handling for filesystem operations and invalid JSON
- Created a reusable interface for reading writing and updating JSON array data
- Separated file storage logic from the application business logic

###### 1 readJsonArray

- I created the readJsonArray function to handle reading JSON array data from a file
- It uses the asynchronous `fs/promises` API instead of synchronous filesystem operations
- It handles missing files empty files and invalid JSON
- I also added an in memory cache using `cacheMap` to avoid reading and parsing the same file on every request

###### 2 writeJsonArray

- I created the writeJsonArray function to centralize writing JSON array data to files
- It uses asynchronous filesystem operations and updates the cache after writing
- I also added file locking to prevent multiple operations from modifying the same file concurrently

###### 3 updateJsonArray

- I created the updateJsonArray function to safely handle read modify write operations
- Instead of reading the file modifying it and writing it back as separate operations I wrapped the complete operation inside withFileLock
- This helps prevent race conditions when multiple requests try to update the same JSON file concurrently

###### File Locking

- I added withFileLock using lockMap to queue operations for each file
- This ensures that operations on the same file are processed sequentially and prevents concurrent updates from overwriting each other
- The locking mechanism is based on the file path so different files can be handled independently

###### Caching

- I added cacheMap to reduce unnecessary filesystem reads
- After reading or updating a file the latest data is stored in memory and reused for subsequent reads
- The cache is also stored per file path so different modules can use the same storage utility without sharing unrelated data

###### Expected Usage

```javascript
// Reading data
const data = await readJsonArray(filePath);

// Writing data
await writeJsonArray(filePath, data);

// Updating data safely
await updateJsonArray(filePath, async (list) => {
  // modify the list
  list.push(newItem);
  return newItem;
});

// Clearing cache
clearCache(filePath);
```

These improvements make the storage layer more reliable efficient reusable and maintainable across the application
