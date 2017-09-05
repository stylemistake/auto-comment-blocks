'use strict';

import { languages, commands, workspace, ExtensionContext, IndentAction, LanguageConfiguration, OnEnterRule, Disposable } from 'vscode';
import { Configuration } from './configuration';

var fs = require('fs');

export function activate(context: ExtensionContext) {
	
	// set language configurations for multi-line Javadoc type blocks
	// TODO first get the disabledLanguages array and check each langId against it before setting single or multi-line blocks
  let languageIdArray = getLanguageIds();
	languageIdArray.forEach((languageId) => {

    let disposable = setLanguageConfiguration(languageId);
		context.subscriptions.push(disposable);
	});
	
	// TODO create map from singleLineConfig and make it accessible to the registered single-line block command
	let singleLineFile: string = __dirname + 
		'/../../language-configuration/single-line-configuration.json';
	let singleLineConfig: Object = JSON.parse(fs.readFileSync(
		singleLineFile, 'utf-8'));
	let commentStyles = Object.keys(singleLineConfig);
	for (let key in commentStyles) {
		for (let langId in singleLineConfig[key]) {
			// TODO add entry <langId, key> to map
		}

		// TODO get user-customized langIds for this key and add to the map
	}

	// register single-line block command 
	registerCommands();
}

export function deactivate() {
  
}

// TODO should now be getting this from the multi-line config file
function getLanguageIds(): Array<string> {
	return Configuration.getConfiguration()
	    .get<Array<string>>(Configuration.languagesSetting);
}

function setLanguageConfiguration(languageId: string): Disposable {
	let config: LanguageConfiguration = { };
  if ((languageId === 'c' || languageId === 'cpp') &&
      Configuration.getConfiguration()
          .get<Boolean>(Configuration.singleLineBlocksSetting)) {

		config.onEnterRules = Configuration.languageConfiguration.onEnterRules
						.concat(Configuration.singleLineBlockEnterRules);
	} else {
		config.onEnterRules = Configuration.languageConfiguration.onEnterRules;
	}

  return languages.setLanguageConfiguration(languageId, config);
}

function registerCommands() {
  commands.registerTextEditorCommand(Configuration.breakSingleLineBlockCommand, 
      (textEditor, edit, args) => {

		if (Configuration.getConfiguration().get<Boolean>
				(Configuration.singleLineBlocksSetting) &&
				(textEditor.document.languageId === 'c' || 
				textEditor.document.languageId === 'cpp') &&
				textEditor.selection.isEmpty) {
			
			let line = textEditor.document.lineAt(textEditor.selection.active);
			if (line.text.search(/^\s*\/\/\/\s*/) !== -1 ||
				line.text.search(/^\s*\/\/\s*/) !== -1) {
				
				let indentedNewline = '\n' + line.text.substring(0, line.text.search(/\//));
				edit.insert(textEditor.selection.active, indentedNewline);
			}
		}
	});
}
