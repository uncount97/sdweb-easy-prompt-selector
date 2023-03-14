# Easy Prompt Selector
Stable Diffusion Webui Extension Easy Prompt Selector.

Fork to translate this sd webui extension from Janpanese to English  

[How to use](https://blue-pen5805.fanbox.cc/posts/5306601)  

After Installed and reloaded SD Webui, click "Pick Tag" button  
![](img/pick_tag.jpg)  

 It will open tag area  
![](img/tag_area.jpg)  

As you can see, it has 3 build-in templates, as examples. Click a tag, it will be added to prompt.  

Tag name and value can be different.   

Those tag templates are saved as `.yml` files in extension's folder.  
![](img/yml.jpg)  

Format is simple, each tag line is just key and value. If key is the same as value, you can skip it as screenshot shows.  

# Tag Folder
Normally, your own tag files should put in `tags` folder. If there is no `.yml` file in tags folder, extension will copy build-in example templates into `tags` folder.  


# Tip
* Tag value doesn't need to be just 1 or 2 words. You can set a whole prompt to 1 tag, then use this tag as a template.  

* In this fork, I add a feature as "If a tag is start with `neg-`, then put this tag into negative prompt, and remove this `neg-` prefix. ". So you don't need to check "Add tag to Neg Prompt"  manually.  

For example, for tag value "neg-child loli", it will be put into negative prompt as "child loli".  

# FYI
Credit goes to this extension's creator, who don't want to translate this good extension into English. So, I have to fork it to do this.   

No feature request will be accepted, since it is a fork.  
