/*:
 * @plugindesc v1.0 Sistema de Seleção de Personagem com HUD e animação
 * @author Juntatudos
 *
 * @help
 * ============================================================================
 * 📌 DESCRIÇÃO
 * ============================================================================
 * Este plugin cria uma cena de seleção de personagem no início do jogo,
 * permitindo ao jogador escolher seu herói inicial.
 *
 * ✔ Exibe personagens na tela
 * ✔ Permite navegação com setas
 * ✔ Destaca personagem selecionado
 * ✔ Anima personagem ativo
 * ✔ Mostra HUD com:
 *    - Retrato
 *    - Nome
 *    - Classe
 *    - HP / MP
 *    - Level
 *
 * ============================================================================
 * 🎮 COMO USAR
 * ============================================================================
 * Use o comando de plugin:
 *
 * SelecaoPersonagem abrir
 *
 * Isso abrirá a tela de seleção.
 *
 * ============================================================================
 * ⚙️ CONFIGURAÇÃO
 * ============================================================================
 * Os personagens são definidos diretamente no código:
 *
 * this._idsDosHerois = [1, 2, 3, 4];
 *
 * Altere os IDs conforme o banco de dados.
 *
 * ============================================================================
 * 📦 REQUISITOS
 * ============================================================================
 * RPG Maker MV
 *
 * ============================================================================
 * 🛠️ AUTOR
 * ============================================================================
 * Desenvolvido por Cleyton Firmino
 *
 * ============================================================================
 * 📄 LICENÇA
 * ============================================================================
 * PROIBIDA COMERCIALIZAO DO PLUGIN;
   FAZER A DEVIDA REFERENCIA AO AUTOR.
 *
 */
 
 // =============================================================================
// PLUGIN: Seleção de Personagem (COM HUD)
// =============================================================================

function Scene_Selecao() {
    this.initialize.apply(this, arguments);
}

Scene_Selecao.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Selecao.prototype.constructor = Scene_Selecao;


// ===============================
// CREATE
// ===============================

Scene_Selecao.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);

    this._idsDosHerois = [1, 2, 3, 4];
    this._spritesHerois = [];
    this._characters = [];
    this._index = 0;

    this.criarJanela();
    this.criarPersonagens();

    // 🔥 NOVO: HUD
    this.criarHudPersonagem();
};


// ===============================
// HUD TEXTO
// ===============================

Scene_Selecao.prototype.criarJanela = function() {

    var largura = 400;
    var altura = 70;

    var x = (Graphics.boxWidth - largura) / 2;
    var y = 10;

    this._janela = new Window_Base(x, y, largura, altura);
    this.addWindow(this._janela);

    this._janela.drawText("ESCOLHA SEU PERSONAGEM", 0, 0, largura, 'center');
};


// ===============================
// HUD PERSONAGEM (NOVO)
// ===============================

Scene_Selecao.prototype.criarHudPersonagem = function() {

    // 🔥 TAMANHO MAIOR
    var largura = 420;
    var altura = 240;

    // 🔥 CENTRALIZA NA TELA
    var x = (Graphics.boxWidth - largura) / 2;
    var y = (Graphics.boxHeight - altura) / 2;

    this._hudWindow = new Window_Base(x, y, largura, altura);
    this.addWindow(this._hudWindow);
};


// ===============================
// PERSONAGENS
// ===============================

Scene_Selecao.prototype.criarPersonagens = function() {

    var total = this._idsDosHerois.length;

    var espacamento = 120;
    var larguraTotal = (total - 1) * espacamento;

    var startX = (Graphics.boxWidth / 2) - (larguraTotal / 2);
    var posY = Graphics.boxHeight - 60;

    for (var i = 0; i < total; i++) {

        var ator = $dataActors[this._idsDosHerois[i]];
        if (!ator) continue;

        var character = new Game_Character();
        character.setImage(ator.characterName, ator.characterIndex);

        (function(char, x, y) {

            char.screenX = function() {
                return x;
            };

            char.screenY = function() {
                return y;
            };

        })(character, startX + (i * espacamento), posY);

        var sprite = new Sprite_Character(character);

        this.addChild(sprite);

        this._spritesHerois.push(sprite);
        this._characters.push(character);
    }
};


// ===============================
// UPDATE
// ===============================

Scene_Selecao.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);

    this.controlarInput();
    this.atualizarSelecao();
    this.animarSelecionado();

    // 🔥 NOVO: atualiza HUD
    this.atualizarHud();

    // animação dos personagens
    for (var i = 0; i < this._characters.length; i++) {
        if (this._characters[i]) {
            this._characters[i].update();
        }
    }
};


// ===============================
// HUD UPDATE (NOVO)
// ===============================

Scene_Selecao.prototype.atualizarHud = function() {

    this._hudWindow.contents.clear();

    var atorId = this._idsDosHerois[this._index];
    var ator = $gameActors.actor(atorId);

    if (!ator) return;

    // 🔥 RETRATO (maior destaque)
    this._hudWindow.drawFace(ator.faceName(), ator.faceIndex(), 0, 0, 144, 144);

    // 🔥 NOME
    this._hudWindow.drawText(ator.name(), 160, 0, 240);

    // 🔥 CLASSE
    this._hudWindow.drawText("Classe: " + ator.currentClass().name, 160, 30, 240);

    // 🔥 LEVEL
    this._hudWindow.drawText("Level: " + ator.level, 160, 60, 240);

    // 🔥 HP
    this._hudWindow.drawText("HP: " + ator.hp + "/" + ator.mhp, 160, 100, 240);

    // 🔥 MP
    this._hudWindow.drawText("MP: " + ator.mp + "/" + ator.mmp, 160, 130, 240);
};

// ===============================
// INPUT
// ===============================

Scene_Selecao.prototype.controlarInput = function() {

    if (Input.isTriggered('right')) this._index++;
    if (Input.isTriggered('left')) this._index--;

    this._index = this._index.clamp(0, this._idsDosHerois.length - 1);

    if (Input.isTriggered('ok')) this.confirmar();

    if (Input.isTriggered('cancel')) {
        SoundManager.playCancel();
        SceneManager.pop();
    }
};


// ===============================
// VISUAL
// ===============================

Scene_Selecao.prototype.atualizarSelecao = function() {

    for (var i = 0; i < this._spritesHerois.length; i++) {

        var sprite = this._spritesHerois[i];

        if (i === this._index) {
            sprite.scale.x = 1.3;
            sprite.scale.y = 1.3;
            sprite.opacity = 255;
        } else {
            sprite.scale.x = 1;
            sprite.scale.y = 1;
            sprite.opacity = 150;
        }
    }
};


// ===============================
// ANIMAÇÃO
// ===============================

Scene_Selecao.prototype.animarSelecionado = function() {

    for (var i = 0; i < this._characters.length; i++) {

        var char = this._characters[i];

        if (i === this._index) {
            char.setStepAnime(true);
            char.setWalkAnime(true);
        } else {
            char.setStepAnime(false);
            char.setWalkAnime(false);
            char.setPattern(1);
        }
    }
};


// ===============================
// CONFIRMAR
// ===============================

Scene_Selecao.prototype.confirmar = function() {

    var atorId = this._idsDosHerois[this._index];

    if (!$dataActors[atorId]) {
        SoundManager.playBuzzer();
        return;
    }

    $gameParty._actors = [];
    $gameParty.addActor(atorId);

    $gameVariables.setValue(1, atorId);

    $gamePlayer.refresh();

    SoundManager.playOk();

    SceneManager.goto(Scene_Map);
};


// ===============================
// GLOBAL
// ===============================

window.Scene_Selecao = Scene_Selecao;

// =============================================================================
// PLUGIN COMMAND
// =============================================================================

var _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "SelecaoPersonagem") {

        if (args[0] === "abrir") {
            SceneManager.push(Scene_Selecao);
        }

    }
};