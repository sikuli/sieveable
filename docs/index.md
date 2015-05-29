Sieveable and FDQL
===================
## What is FDQL?
FDQL stands for Functions and Design Query Language. It is a domain-specific language (DSL) for searching user interface (UI) specific functions and design by examples. Sieveable takes FDQL queries as input and returns the results that match the given queries. FDQL is a declarative language that matches apps' features at multiple levels: Listing details, user interface, source code, and functions (actual behaviors).

## Syntax
FDQL is a declarative language that uses a simple syntax with four main clauses:

- ```MATCH```: The app to match.
- ```WHERE```: It contains predicates that describe the data to match based on specific criteria or example.
- ```RETURN```: It specifies the data returned by the query.
- ```LIMIT```: It constrains the number of results returned by the query.

## UI Search Queries

### Element
Find apps that use at least one `LinearLayout` element.

```
MATCH app
WHERE
    <LinearLayout></LinearLayout>
RETURN app
```
### Element with attribute
Find apps that use at least one `LinearLayout` element that has an `android:orientation` attribute with `vertical ` as its value.

```
MATCH app
WHERE
    <LinearLayout android:orientation="vertical"></LinearLayout>
RETURN app
```
### Siblings
Find apps that have at least three buttons as siblings.

```
MATCH app
WHERE
    <Button></Button>
    <Button></Button>
    <Button></Button>
RETURN app
```

### Children

Find apps with a `LinearLayout` that have exactly two children a `Button` and a `ProgressBar`.

```
MATCH app
WHERE
    <LinearLayout>
        <Button></Button>
        <ProgressBar></ProgressBar>
    </LinearLayout>
RETURN app
```

### Selection
Find apps that have exactly 70 `Button` elements.

```
MATCH app
WHERE
    <Button $exactly="70"/>
RETURN app
```

Find apps that have at least 20 `Button` elements.

```
MATCH app
WHERE
    <Button $min="20"/>
RETURN App
```


Find apps that have at most 100 `Button` elements.

```
MATCH app
WHERE
    <Button $max="100"/>
RETURN app
```

### Anonymous elements
Find apps that have at least one `LinearLayout` with exactly two elements of any name as children.

```
MATCH app
WHERE
    <LinearLayout>
        <_/>
        <_/>
    </LinearLayout>
RETURN app
```

Find apps that have a `TabHost` with a direct child of any name which has a `TabWidget` element.

```
MATCH app
WHERE
    <TabHost>
        <_>
            <TabWidget/>
        </_>
    </TabHost>
RETURN app
```

### Element name starts with
Find apps that have at least one element whose name starts with `com.whatsapp.`

```
MATCH app
WHERE
    <com.whatsapp.*/>
RETURN app
```
### Element name ends with
Find apps that have at least one element whose name ends with ".maps.MapView"

```
MATCH app
WHERE
    <*.maps.MapView/>
RETURN app
```


## Listing Details Search Queries

Find apps categorized in the _Communication_ category and developed by _Google Inc._

```
MATCH app
WHERE
    <category>Communication</category>
    <developer>Google Inc.</developer>
RETURN app
```

Find apps that have more than or equal to 10,000,000 downloads and their description texts contain the word "Camera".

```
MATCH app
WHERE
    <download>>=10000000</download>
    <description>$CONTAINS[Camera]</description>
RETURN app
```

## Manifest Search Queries
Find apps that use the Camera permission.

```
MATCH app
WHERE
    <uses-permission android:name="android.permission.CAMERA" />
RETURN app
```
Find apps with API level 11 as the minimum API level supported and with at least 20 activities.

```
MATCH app
WHERE
    <activity $min="20" />
    <uses-sdk android:minSdkVersion="11" />
RETURN app
```

## Code Search Queries

Find apps that call the API method _takePicture_ of the class _android.hardware.Camera_

```
MATCH app
WHERE
    <Code type='invoked' class='android.hardware.Camera' method ='takePicture' />
RETURN app
```

Find apps that call the user defined method _createCameraPreviewSession_.

```
MATCH app
WHERE
    <Code type='defined' method ='createCameraPreviewSession' />
RETURN app
```
## UI Functionalities Search Queries
Find apps that use a button to trigger the device Camera and return the button information.

```
MATCH app
WHERE
    <Button _ref="btn">
	    <Function permission="android.permission.CAMERA"/>
    </Button>
RETURN app, btn
```

Find apps that have a suspicious use of the camera triggered by a button labeled as "Save"

```
MATCH app
WHERE
    <Button android:text="Save">
        <Function permission="android.permission.CAMERA"/>
    </Button>
RETURN app
```

## Diff: Changes Search Queries

### Listing details changes

Find apps that went from 10,000 download count to 1000,000 downloads.

```
MATCH app
WHERE
    <download $diff="10000=>1000000"/>
RETURN app
```

Find apps that had an increase in star rating by one star or more (e.g., from 3.0 star rating to 4.0 or more).

```
MATCH app
WHERE
    <rating $diff="+1"/>
RETURN app
```
### Manifest changes

Find apps that have added the Camera permission to a recent version.

```
MATCH app
WHERE
    <uses-permission permission="android.permission.CAMERA" $diff="+"/>
RETURN app
```

Find apps that added three permissions.

```
MATCH app
WHERE
    <uses-permission $diff="+3" />
RETURN app
```

Find apps that dropped five permissions.

```
MATCH app
WHERE
    <uses-permission $diff="-5" />
RETURN app
```

Find apps that dropped the Camera and Read Contacts permissions but added the Read SMS permission.

```
MATCH app
WHERE
    <uses-permission android:name="android.permission.CAMERA" $diff="-" />
    <uses-permission android:name="android.permission.READ_CONTACTS" $diff="-" />
    <uses-permission android:name="android.permission.READ_SMS" $diff="+" />
RETURN app
```

Find apps that have changed from 10 permissions to 15 or more permissions.

```
MATCH app
WHERE
    <uses-permission $diff="10=>15+"/>
RETURN app
```

### UI changes
Find apps that have added 30 buttons to a recent version.

```
MATCH app
WHERE
    <Button $diff="30+"/>
RETURN app
```

Find apps that have removed 30 buttons from a recent version.

```
MATCH app
WHERE
    <Button $diff="30-"/>
RETURN app
```

Find apps that went from 30 buttons to 80 ore more buttons in a recent version.

```
MATCH app
WHERE
    <Button $diff="30=>80+"/>
RETURN app
```


### Code changes
Find apps that removed the call to the API method _takePicture_ of the deprecated class _android.hardware.Camera_

```
MATCH app
WHERE
    <Code type="invoked" class="android.hardware.Camera" method ="takePicture" $diff="-" />
RETURN app
```


Find apps that added the call to the API method _ capture_ of the class _android.hardware.camera2.CameraCaptureSession_

```
MATCH app
WHERE
    <Code type="invoked" class="android.hardware.camera2.CameraCaptureSession" method ="capture" $diff="+" />
RETURN app
```

## Operators
FDQL supports different operators that operate on values (element text or attribute) or queries.
### Values Comparison operators
Element text values and attribute values may contain comparison operators.
The supported comparison operators are `!=`, `>`, `<`, `<=`, `>=`. `RANGE`

|Operator        | Description           
| ------------- |:-------------:|
| `!=`     | Matches values that are not equal to a specified value. |
| `>`     | Matches numerical values that are greater than the specified value. |
| `<`     | Matches numerical values that are less than the specified value. |
| `>=`     | Matches numerical values that are greater than or equal the specified value. |
| `<=`     | Matches values that are less than or equal to the specified value. |
|`$RANGE[val1,...,valN]` OR `$RANGE[start:end]`  | Matches numerical values that are equal to any value in the specified array or range.|
|`$NRANGE[val1,...,valN]` OR `$NRANGE[start:end]`  | Matches numerical values that are not equal to any value in the specified array or range.|
|`$CONTAINS[val1,...,valN]` OR `$CONTAINS[start:end]` OR `$CONTAINS[val]` | Matches values that are equal to any value in the specified array of values.

__Examples__

Find apps with more than 1000 downloads.

```
MATCH app
WHERE 
    <download>>1000</download>
RETURN app
```
Find apps with a number of permissions between 10 and 15.

```
MATCH app
WHERE
    <uses-permissions>$RANGE[10:15]</download>
RETURN app
```

Find apps with the word camera in their description texts.

```
MATCH app
WHERE
    <description>$CONTAINS[camera]</description>
RETURN app
```

## Special Attributes

| Special Attribute | Description|
|----------|:----------:|
| `$min=N`| Matches the highest occurrences of an element.|
| `$max=N`| Matches the lowest occurrences of an element. |
| `$exactly=N`| Matches the exact occurrences of an element. |
| `$ref="variable"` | |

__Examples:__

Find apps that use at most 2 permissions.

```
MATCH app
WHERE
    <uses-permission $max="2"/>
RETURN app
```

Find apps that have at least 10 permissions.

```
MATCH app
WHERE
    <uses-permission $min="10"/>
RETURN app
```

Find apps that use exactly 50 Buttons.

```
MATCH app
WHERE
    <Button $exactly="50"/>
RETURN app
```


## Special Values
### Element Values
| Special Value | Description|
|----------|:----------:|
| `<abc*>`| Matches an element name that starts with abc.|
| `<*abc>`| Matches an element name that ends with abc.|
| `$ref=variable` | A variable that can be attached to any element in the search query, so it can be referenced in the `RETURN` clause.| 


__Examples__

Find apps that have at least one element whose name starts with `com.google.*`

```
MATCH app
WHERE
    <com.google.* />
RETURN app
```
Find apps that have at least one element whose name ends with `Button` and return the button information.

```
MATCH app
WHERE
    <*Button $ref='var'/>
RETURN app, var
```


### Attributes Values
Attribute values may contain special attribute values.

| Special Value | Description|
|----------|:----------:|
| `$EXISTS`| Matches an attribute that exists with any value.
| `$NEXISTS`| Matches an attribute that does not exist.
| `abc*`| Matches an attribute value that starts with abc.
| `*abc`| Matches an attribute value that ends with abc.



__Examples__

Find apps that have at least one button with the attribute android:onClick.

```
MATCH app
WHERE
    <Button android:onClick=$EXISTS/>
RETURN app
```
Find apps that have at least one button with the attribute android:onClick.

```
MATCH app
WHERE
    <Button android:onClick=$NEXISTS/>
RETURN app
```

Find apps that have at least one element that has an attribute name that starts with abc

```
MATCH app
WHERE
    <Button abc*=$EXISTS/>
RETURN app
```

### Joins Query Boolean Operators
Queries may be joined by boolean operators. FDQL supports the following join query boolean operators: `AND`,`OR`,`NOT`,`NOR`

#### OR 
Joins the search query clause with a logical OR. It returns all results that match either search clause.

__Example:__

Find apps categorized in the Communication category and have at least three sibling Buttons OR at least three sibling ImageButtons

```
MATCH app
WHERE
    <category>Communication</category>
    <Button></Button>
    <Button></Button>
    <Button></Button>
OR
    <ImageButton></ImageButton>
    <ImageButton></ImageButton>
    <ImageButton></ImageButton>
RETURN app
```

#### AND
Joins the search query clause with a logical AND. It returns all results that match both search clauses.

__Example:__

```
MATCH app
WHERE
    <Download>Communication</Download>
    <Button></Button>
AND
    <ImageButton></ImageButton>
    <ImageButton></ImageButton>
    <ImageButton></ImageButton>
RETURN app
```

#### NOR 
Joins the search query clause with a logical NOR. It returns all results that do not match both search clauses.

```
MATCH app
    <Download>Communication</Download>
    <Button></Button>
    <Button $ref="a"></Button>
    <Button></Button>
NOR
    <ImageButton></ImageButton>
    <ImageButton></ImageButton>
    <ImageButton></ImageButton>
RETURN app.name, a
```

## Results

You can specify the maximum number of results the search query will return using the keyword `LIMIT N`

__Example:__ 

Return the first 10 results of apps with a `LinearLayout` with three buttons.

```
MATCH app
    <LinearLayout>
        <Button></Button>
        <Button></Button>
        <Button></Button>
    </LinearLayout>
RETURN app
LIMIT 10
```

## Glossary
__element__

An xml element that begins with a start tag and ends with a matching end tag. Example: `<Button/>` and `<Title>Google Maps<Title>`

__element content__

Element's content are the characters between the element's start and end tags. Example: `<Button/>` and `<Title>Google Maps<Title>`

__attribute__

An attribute consists of name and value pair that exists within the element's start tag. For example: `<Button android:onClick="doClick"`, the Button element has an attribute with the name android:onClick and the value of doClick.