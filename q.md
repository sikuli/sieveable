# Q5 


Query

```
// q5.xml
<X>
    <Y/>
    <Y/>
    <Y/>
    <Y+/>
</X>
```
AST

```javascript
parse('q5.xml') 

// ===>

var ast = {	
	name: 'x',
	childen: ['y','y','y+']
}
```

```
X = 'LinearLayout'
Y = 'Button'

// ====>

var locals = {x: 'LinearLayout', y: 'Button'}

```


Find

```
<LinearLayout>
	<Button/>
	<Button/>
	<Button+/>
</LinearLayout>
```

```javascript
find('q5.xml', {x: 'LinearLayout', y: 'Button'})

```

```

render(ast, locals)

==>

'x' <-- 'LinearLayout'
'y' <-- 'Button'
'n' <-- children.lenght 
```

```
    console.log('Find ViewGroups with mulitple buttons (> ' + n + ')' +
        ' as direct children');

    apps.forEach(function(app) {
        var $ = cheerio.load(app.xml);
        
        // TODO: use x somewhere

        $(y).each(function(){

            var btns = $(this).siblings(y);
            if (btns.length > n){
                var packageName = $(this).parents('App').attr('name');
                var versionCode = $(this).parents('App').attr('version_code');
                console.log(packageName + ', version: ' + versionCode + 
                    ', total: ' + btns.length);
            }

        })
    })

    return 'done';
```

# Q5+

Design 1

```
// before.xml
<X>
    <Y/>
    <Y/>
    <Y/>
</X>

// after.xml
<X>
    <Y/>
    <Y/>
    <Y/>
    <Y/>
</X>
```

```
find('before.xml','after.xml', {X: 'LinearLayout', Y: 'Button'})
```




# Q6

```
<X/>

```

```
X = 'android.support.v4.view.ViewPager'
```

# Q4

```
<TabHost xmlns:android="http://schemas.android.com/apk/res/android"
          android:id="@android:id/tabhost">
        <LinearLayout 
            android:id="@+id/LinearLayout01">
                <TabWidget
                    android:id="@android:id/tabs">
                </TabWidget>
                <FrameLayout
                    android:id="@android:id/tabcontent">
                </FrameLayout>
        </LinearLayout>

</TabHost>
```


```
<X>
	<LinearLayout>
		<Y+/>
	</LinearLayout>
</X>
```

```
X = TabHost
Y = TabWidget
```


# Q7

Nested structures

```xml
<X>
	<X+>
		<X+>
		</X+>
	</X+>
</X>
```

matches

```
<X>
	<X>
		<X>
		</X>
	</X>
</X>
```

```
<X>
	<X>
		<X>
		</X>
	</X>
	<X>
		<X>
		</X>
	</X>	
</X>
```

```
<X>
	<X>
		<X>
		</X>
		<X>
		</X>		
	</X>
	<X>
		<X>
		</X>
	</X>	
</X>
```

but doesn't match

```
<X>
	<X>
	</X>
	<X>
	</X>	
</X>
```


	X = 'PreferenceScreen'

