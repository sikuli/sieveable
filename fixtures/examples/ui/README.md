# Android UI Design Examples

### Q1: Find the number of custom UI components for each app?

Custom UI components (widgets or layouts) are created by subclassing the prebuilt widgets or layouts and overriding their methods. There are two ways to use a custom UI component:
(1) If the custom UI component is defined as an inner class within an Activity class, then it can be used in the XML layout files as a generic view with the _class_ attribute specifying it in the full qualifed package name.

Example 1:

```
<view
  class="com.android.notepad.NoteEditor$MyEditText"
  id="@+id/note"
  …
```
(2) If the custom UI component is not defined as an inner class, then it can be used as an XML element whose name is the full qualifed package name.

Example 2:

```
<com.android.notepad.MyEditText
  id="@+id/note"
  ... />
```

### Q2: Find home screen widgets that support resizing?

Home screen widgets can be defined using the ```<appwidget-provider>``` element in an XML resource  inside the _res/xml_ folder. In order to support resiziable home screen widgets (horizontally and/or vertically), developers should use the resizeMode attribute of the ```<appwidget-provider>``` element, which is created inside the _res/xml/_ folder.

Example:

```$ cat /res/xml/appwidget_provider.xml ```

```
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="30dp"
    android:resizeMode="horizontal|vertical"
    android:initialLayout="@layout/widget_clear_view" />

```


### Q3: Find apps with navigation drawers?
Navigation drawers are declared in the layout file with a _DrawerLayout_ element as a root with two children, the first child is the primary layout and the second child contains the contents of the navigation drawer. It can be also defined as a View element with the _class_ attribute set to the _DrawerLayout_ class.

Example 1:

```
<android.support.v4.widget.DrawerLayout
    xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/drawer_layout">
    <!-- The main content view -->
    <FrameLayout
        android:id="@+id/content_frame"
        ... />
    <!-- The navigation drawer -->
    <ListView android:id="@+id/left_drawer"
        .../>
</android.support.v4.widget.DrawerLayout>
```

Example 2:

```
<view android:id="@id/drawer_container"
      class="android.support.v4.widget.DrawerLayout"
      xmlns:android="http://schemas.android.com/apk/res/android">
    <FrameLayout android:id="@id/cards_container" >
        <ViewStub android:id="@id/read_now_home_view" android:layout="@layout/read_now_home_view" />
        <ViewStub android:id="@id/my_library_home_view" android:layout="@layout/my_library_home_view" />
        <RelativeLayout >
            <ProgressBar android:id="@id/progress" android:layout_centerInParent="true" />
        </RelativeLayout>
    </FrameLayout>
    <LinearLayout android:orientation="vertical" android:id="@android:id/empty">
        <TextView android:text="@string/welcome_title" />
        <TextView android:text="@string/welcome_text" />
    </LinearLayout>
</view>
```

### Q4: Find apps that use tab layouts with TabHost for navigation?

Apps that implement tabs using TabHosts use a TabHost with TabWidget as a child element in the layout file.

Example:

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

### Q5: Find apps that use a ViewGroup with n number of buttons as direct children?

Example: a LinearLayout with 3 Buttons.

```
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android" android:layout_width="fill_parent" android:layout_height="fill_parent">
    <Button  android:id="@id/black_dialog_confirm_button"/>
    <Button android:id="@id/black_dialog_cancel_button"/>
    <Button android:id="@id/black_dialog_help_button"/>
</LinearLayout>
```

### Q6: Find apps that support horizontal paging?
To implement horizontal paging, the most common approach is to use a ViewPager view group element which can hold multiple child view elements.

```
<android.support.v4.view.ViewPager xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    android:id="@+id/pager"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    tools:context=".MainActivity" />
```

### Q7: Find apps that use settings/preferences subscreens?

Settings or preferences can be grouped into different subscreens and statically implemented using the _Preference_ API. Preferences are defined in a file inside _/res/xml_ directory. The root node for the XML file must be a ```<PreferenceScreen>``` element. Inside this element, another ```<PreferenceScreen>``` element is used to hold a group of preferences objects that subclass the Preference class such as _CheckBoxPreference, EditTextPreference, ListPreference, MultiSelectListPreference, PreferenceCategory, PreferenceScreen, SwitchPreference, DialogPreference, PreferenceGroup, RingtonePreference_, and _TwoStatePreference_.

Example:

```
<PreferenceScreen  xmlns:android="http://schemas.android.com/apk/res/android">
    <PreferenceScreen
        android:key="button_notification_category_key"
        android:title="@string/notification_title"
        android:persistent="false">
        <ListPreference
            android:key="button_notification_key"
            android:title="@string/sms_notification_info_title"/>
        <PreferenceScreen
            android:key="button_notify_email_setting_key"
            android:title="@string/sms_settings"
            android:persistent="false">
            <CheckBoxPreference
                android:key="pref_key_auto_remind"
                android:summary="@string/pref_remind_unread_sms_desc"
                android:title="@string/pref_remind_unread_sms_title"
                android:defaultValue="false"/>
        </PreferenceScreen>
        <EditTextPreference
            android:key="button_message_limit_key"
            android:title="@string/button_message_limit_title"
            android:ringtoneType="notification"/>
        ...
    </PreferenceScreen>
    ...
</PreferenceScreen>
```


### Q8: Find apps that use a ViewGroup with an ImageView and a RatingBar elemenets as descendant?

Example:

```
<LinearLayout android:orientation="horizontal">
        <RatingBar android:layout_gravity="center_vertical"
                   android:id="@id/rating"/>
        <ImageView android:id="@id/rating_image" />
        <com.google.android.apps.youtube.core.ui.YouTubeTextView
                   android:id="@id/app_price"  />
</LinearLayout>

```


### Q9: Find apps that use a GridView, which has a sibiling ViewGroup that has at least one child View?

Example:

```
<RelativeLayout android:background="#ffe2e2e2">
    <GridView android:id="@id/gridview" />
    <LinearLayout android:id="@id/progressView" >
        <TextView android:id="@id/progressText" />
        <ProgressBar android:id="@id/progress" />
    </LinearLayout>
</RelativeLayout>

```


### Q10: Find apps that use SearchView as an action view in the Action Bar?

SearchView can be embeded in the Action Bar as a collapsible view. This can be defined using the _actionViewClass_ attribute to define the SearchView widget class to use for search. This attribute is defined in an XML file inside the app's _res/menu/_ directory.

Example:

```
<?xml version="1.0" encoding="utf-8"?>
<menu xmlns:android="http://schemas.android.com/apk/res/android"
      xmlns:yourapp="http://schemas.android.com/apk/res-auto" >
    <item android:id="@+id/action_search"
          android:title="@string/action_search"
          android:icon="@drawable/ic_action_search"
          yourapp:showAsAction="ifRoom|collapseActionView"
          yourapp:actionViewClass="android.support.v7.widget.SearchView" />
    ...
</menu>
```
