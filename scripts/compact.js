/******************************************************************************
 * compact.js
 * 
 * Contains html replacement for the compact mode tracker.
*******************************************************************************/

///
/// Initialize callbacks for compact tracker settings.
///
function initializeCompactTrackerSettings() {
    function combineMiscAndCompact() {
        // reset the page state when changing tracker layouts
        resetPage();

        var compact_checked = $("#compact-tracker").is(':checked');
        var misc_checked = $("#combine-misc").is(':checked');

        $(".colorblind-label").toggle($("#colorblind").is(':checked'));
        if (compact_checked) {
            if (misc_checked) {
                $(".misc-tracker, .keys-tracker").toggle(false);
                $(".compact-misc-item").toggle(true);

                $("#main-tracker-name").text("Basically Everything");
                $("#main-tracker-name").css("font-size", "2em");
            } else {
                $(".misc-tracker, .keys-tracker").toggle(true);
                $(".compact-misc-item").toggle(false);

                $("#main-tracker-name").text("Required Items");
                $("#main-tracker-name").css("font-size", "2.75em");
            }
        } else {
            $(".misc-tracker, .keys-tracker").toggle(true);
        }

        // hide odd key if blue house is open
        var isChecked = $("#blue-house-open").is(':checked');
        $(".blue-house-optional").each(function() {
            // make sure to hide / show the correct odd key
            if ($(this).hasClass("compact-misc-item")) {
                $(this).toggle(!isChecked && misc_checked && compact_checked);
            } else {
                $(this).toggle(!isChecked);
            }
        });

        // hide crystal ball if koopa koot is not randomized
        isChecked = $("#koopa-koot-randomized").is(':checked');
        $(".koopa-koot-generated-item").toggle(isChecked);

        // handle dojo visibility
        isChecked = $("#dojo-randomized").is(':checked');
        var isCompactMiscCombined = compact_checked && misc_checked;
        $(".dojo-optional").toggle(isChecked && isCompactMiscCombined);
        $(".dojo-tracker").toggle($("#dojo-randomized").is(':checked') && !isCompactMiscCombined);

        // show/hide useless items
        isChecked = $("#useless-items").is(':checked');
        $(".useless-item").toggle(isChecked);

        isChecked = $("#recipe-tooltips").is(':checked');
        $(".tooltiptext").toggle(isChecked);

        // enforce letter visibility
        $("#Letters").parent().toggle(!$("#letters-randomized").is(':checked'));
    }

    $("#compact-tracker").click(function() {
        // make correct tracker visible
        var isChecked = $(this).is(':checked');
        var currentTracker = $(".main-tracker").html();
        $(".main-tracker").html(altTracker);
        $(".main-tracker").toggleClass("compact");
        altTracker = currentTracker;
        initializePage();
        localStorage.setItem("compact-tracker", isChecked);

        // hide/show compact tracker options
        $(".compact-tracker-options").toggle(isChecked && !$("#toggle-tracker-config td.section-toggle").hasClass("section-toggle-closed"));
        combineMiscAndCompact();

        // update bowser key visibility in the new tracker
        isChecked = $("#fast-bowser-castle").is(':checked');
        $("#BowsersKeySlot").toggle(!isChecked);

        // update power star visibility in the new tracker
        isChecked = $("#power-star").is(':checked');
        maxKeyCounts[16] = parseInt($("#power-star-num").val());
        $(`p[data-chapter-key-count="16"]`).text(`${currentKeyCounts[16]}/${maxKeyCounts[16]}`);
        if(maxKeyCounts[16] >= 100){
            console.log(maxKeyCounts[16], "Cur count high");
            $(`p[data-chapter-key-count="16"]`).css("font-size", "1.125em");
        }else{
            console.log(maxKeyCounts[16], "Cur count low");
            $(`p[data-chapter-key-count="16"]`).css("font-size", "");
        }
        $("#PowerStarSlot").toggle(isChecked);
        $("#StarRodSlot").toggle(!isChecked);

        // update Entrance Shuffle tracker visibility in the new tracker
        isChecked = $("#dungeon-entrances-randomized").is(':checked');
        $("#DungeonEntranceRow").toggle(isChecked);

        updateKeyItemHighlight();
        sortCompactTracker($("#compact-tracker-order").find(':selected').val() === "true");
    });

    $("#combine-misc").click(function() {
        var isChecked = $(this).is(':checked');
        localStorage.setItem("combine-misc", isChecked);
        combineMiscAndCompact();
        synchronizeMapsAndTracker();
        sortCompactTracker($("#compact-tracker-order").val() === "true");
    });

    function updateKeyItemHighlight() {
        if ($("#compact-tracker").is(':checked') && $("#highlight-key").is(':checked')) {
            $("img.key-item").each(function() {
                if ($(this).hasClass("unselected")) {
                    $(this).addClass("completable");
                }
            });
        } else {
            $("img.key-item").each(function() {
                $(this).removeClass("completable");
            });
        }
    }

    $("#highlight-key").click(function() {
        var isChecked = $(this).is(':checked');
        localStorage.setItem("highlight-key", isChecked);
        updateKeyItemHighlight();
    });

    $("#tracker-logic").click(function() {
        useTrackerLogic = $(this).is(':checked');
        localStorage.setItem("tracker-logic", useTrackerLogic);
    });

    function sortCompactTracker(requiredFirst) {
        $(".compact-misc-item").css("order", (requiredFirst) ? 1 : 0);
    }
    
    $("#compact-tracker-order").on("change", function() {
        sortCompactTracker($(this).val() === "true");
        localStorage.setItem("compact-tracker-order", $(this).val());
    });
}

///
/// Load compact tracker config from localstorage.
///
function loadCompactTrackerSettings() {
    var compact_tracker_order = localStorageGetWithDefault("compact-tracker-order", "false") == "true";
    if (compact_tracker_order) {
        $("#compact-tracker-order").val("true");
    }

    var use_compact_tracker = localStorageGetWithDefault("compact-tracker", false) == "true";
    if (use_compact_tracker) {
        $("#compact-tracker").click();
    }

    var combine_misc = localStorageGetWithDefault("combine-misc", false) == "true";
    if (combine_misc) {
        $("#combine-misc").click();
    }

    var highlight_key_items = localStorageGetWithDefault("highlight-key", false) == "true";
    if (highlight_key_items) {
        $("#highlight-key").click();
    }
}

// alternate tracker html, default tracker is in index.html, so this version is a more compact layout
var altTracker = `<table width="100%">
<tr style="height: 4em;">
    <td style="text-align: left; width: 60%;">
        <h1 id="main-tracker-name">Required Items</h1>
    </td>
    <td style="text-align: right;">
        <h2></h2>
    </td>
</tr>
</table>
<div style="display:flex;flex-wrap:wrap;padding-left:10px;">
    <div class="compact-element"><img data-chapter-star="1" id="Eldstar" class="unselected star-spirit" src="images/icons/Eldstar_PM.png"></div>
    <div class="compact-element"><img data-chapter-star="2" id="Mamar" class="unselected star-spirit" src="images/icons/Mamar_PM.png"></div>
    <div class="compact-element"><img data-chapter-star="3" id="Skolar" class="unselected star-spirit" src="images/icons/Skolar_PM.png"></div>
    <div class="compact-element"><img data-chapter-star="4" id="Muskular" class="unselected star-spirit" src="images/icons/Muskular_PM.png"></div>
    <div class="compact-element"><img data-chapter-star="5" id="Misstar" class="unselected star-spirit" src="images/icons/Misstar_PM.png"></div>
    <div class="compact-element"><img data-chapter-star="6" id="Klevar" class="unselected star-spirit" src="images/icons/Klevar_PM.png"></div>
    <div class="compact-element"><img data-chapter-star="7" id="Kalmar" class="unselected star-spirit" src="images/icons/Kalmar_PM.png"></div>
    <div id="StarRodSlot" class="compact-element"><img data-chapter-star="8" id="Star Rod" class="unselected star-spirit" src="images/icons/PM_Starrod.png"></div>
    <div id="PowerStarSlot" class="compact-element">
        <img data-chapter-key="16" id="Power Stars Found" class="unselected key-item" src="images/icons/Power_Star.png">
        <br>
        <p data-chapter-key-count="16">0/120</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.1</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.2</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.3</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.4</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.5</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.6</p>
    </div>
    <div id="DungeonEntranceRow" class="compact-element">
        <img id="Unknown" data-state="0" class="boss" src="images/bosses/unknown.png">
        <p class="boss-chapter">Ch.7</p>
    </div>
    <div class="compact-element"><img id="Goombario" class="unselected partner" src="images/partners/goombario.png"></div>
    <div class="compact-element"><img id="Kooper" class="unselected partner" src="images/partners/kooper.png"></div>
    <div class="compact-element"><img id="Bombette" class="unselected partner" src="images/partners/bombette.png"></div>
    <div class="compact-element"><img id="Parakarry" class="unselected partner" src="images/partners/parakarr.png"></div>
    <div class="compact-element"><img id="Bow" class="unselected partner" src="images/partners/bow.png"></div>
    <div class="compact-element"><img id="Watt" class="unselected partner" src="images/partners/watt.png"></div>
    <div class="compact-element"><img id="Sushie" class="unselected partner" src="images/partners/sushie.png"></div>
    <div class="compact-element"><img id="Lakilester" class="unselected partner" src="images/partners/lakilester.png"></div>
    <div class="compact-element"><img id="Boots" data-state="0" class="boots upgrade" src="images/upgrades/PM_Normal_Boots_Sprite.png"></div>
    <div class="compact-element"><img id="Hammer" data-state="0" class="hammer upgrade" src="images/upgrades/PM_Normal_Hammer_Sprite.png"></div>
    <div class="compact-element"><img id="Ultra Stone" class="unselected optional-item" src="images/icons/UltraStone.gif"></div>
    <div class="compact-misc-item compact-element"><img id="Dolly" class="unselected optional-item" src="images/icons/PeachDoll_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Kooper's Shell" class="unselected optional-item" src="images/icons/Kooper'sShell_PM.png"></div>
    <div class="compact-element">
        <img data-chapter-key="1" id="Fortress Key" class="unselected key-item" src="images/icons/FortressKey_PM.png">
        <br>
        <p data-chapter-key-count="1">0/4</p>
    </div>
    <div class="compact-misc-item compact-element">
        <img data-chapter-key="13" id="Letters" class="unselected optional-item" src="images/icons/PM_Letter_Sprite.png">
        <br>
        <p data-chapter-key-count="13">0/3</p>
    </div>
    <div class="compact-element"><img data-chapter="2" id="Pulse Stone" class="unselected key-item" src="images/icons/PulseStone.gif"></div>
    <div class="compact-element"><img data-chapter="2" id="Pyramid Stone" class="unselected key-item" src="images/icons/PyramidStone.gif"></div>
    <div class="compact-element"><img data-chapter="2" id="Diamond Stone" class="unselected key-item" src="images/icons/DiamondStone.png"></div>
    <div class="compact-element"><img data-chapter="2" id="Lunar Stone" class="unselected key-item" src="images/icons/LunarStone.gif"></div>
    <div class="compact-element">
        <img data-chapter-key="2" id="Ruins Key" class="unselected key-item" src="images/icons/Ruins_Key.png">
        <br>
        <p data-chapter-key-count="2">0/4</p>
    </div>
    <div class="compact-misc-item compact-element"><img id="Artifact" class="unselected optional-item" src="images/icons/Artifact_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Record" class="unselected optional-item" src="images/icons/Record.gif"></div>
    <div class="compact-misc-item compact-element"><img id="Weight" class="unselected optional-item" src="images/icons/WeightPM.gif"></div>
    <div class="compact-element"><img data-chapter="3" id="Boo's Portrait" class="unselected key-item" src="images/icons/Boo'sPortrait_PM.png"></div>
    <div class="compact-element">
        <img data-chapter-key="3" id="Tubba Castle Key" class="unselected key-item" src="images/icons/Tubba_Blubba_Castle_Key.png">
        <br>
        <p data-chapter-key-count="3">0/3</p>
    </div>
    <div class="compact-misc-item compact-element">
        <img id="Storeroom Key" class="unselected optional-item" src="images/icons/OddKey.gif">
        <div class="colorblind-label">S</div>
    </div>
    <div class="compact-element"><img data-chapter="4" id="Toy Train" class="unselected key-item" src="images/icons/ToyTrain_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Calculator" class="unselected optional-item" src="images/icons/Calculator_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Frying Pan" class="unselected optional-item" src="images/icons/PM_Frying_Pan.png"></div>
    <div class="compact-misc-item compact-element"><img id="Mailbag" class="unselected optional-item" src="images/icons/Mailbag_PM.png"></div>
    <div class="compact-element"><img data-chapter="4" id="Cake" class="unselected key-item" src="images/icons/Cake.gif"></div>
    <div class="compact-misc-item compact-element useless-item"><img id="Cookbook" class="unselected optional-item" src="images/icons/Cook_Book_Paper_Mario.png"></div>
    <div class="compact-misc-item compact-element"><img id="Dictionary" class="unselected optional-item" src="images/icons/PM_Dictionary.png"></div>
    <div class="compact-misc-item compact-element useless-item"><img id="Mystery Note" class="unselected optional-item" src="images/icons/MysteryNote.png"></div>
    <div class="compact-element"><img data-chapter="5" id="Jade Raven" class="unselected key-item" src="images/icons/JadeRaven_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Volcano Vase" class="unselected optional-item" src="images/icons/VolcanoVase.gif"></div>
    <div class="seed-1 compact-element"><img data-chapter="6" id="Magical Seed 1" class="unselected key-item" src="images/icons/MagicalSeed1.png"></div>
    <div class="seed-2 compact-element"><img data-chapter="6" id="Magical Seed 2" class="unselected key-item" src="images/icons/MagicalSeed2.png"></div>
    <div class="seed-3 compact-element"><img data-chapter="6" id="Magical Seed 3" class="unselected key-item" src="images/icons/MagicalSeed3.png"></div>
    <div class="seed-4 compact-element"><img data-chapter="6" id="Magical Seed 4" class="unselected key-item" src="images/icons/MagicalSeed4.png"></div>
    <div class="compact-element"><img data-chapter="6" id="Magical Bean" class="unselected key-item" src="images/icons/MagicBean_PM.png"></div>
    <div class="compact-misc-item compact-element">
        <img id="Red Berry" class="unselected optional-item" src="images/icons/PaperMario_Items_RedBerry.png">
        <div class="colorblind-label">R</div>
    </div>
    <div class="compact-misc-item compact-element">
        <img id="Yellow Berry" class="unselected optional-item" src="images/icons/PaperMario_Items_YellowBerry.png">
        <div class="colorblind-label">Y</div>
    </div>
    <div class="compact-misc-item compact-element">
        <img data-chapter-key="15" id="Blue Berry" class="unselected optional-item" src="images/icons/PaperMario_Items_BlueBerry.png">
        <div class="colorblind-label" style="top:10px;">B</div>
        <p data-chapter-key-count="15">0/2</p>
    </div>
    <div class="compact-element"><img data-chapter="6" id="Fertile Soil" class="unselected key-item" src="images/icons/Fertilesoil.png"></div>
    <div class="compact-misc-item compact-element"><img id="Crystal Berry" class="unselected optional-item" src="images/icons/CrystalBerry_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Water Stone" class="unselected optional-item" src="images/icons/WaterStone_PM.png"></div>
    <div class="compact-element"><img data-chapter="6" id="Miracle Water" class="unselected key-item" src="images/icons/MiracleWater_PM.png"></div>
    <div class="compact-misc-item compact-element"><img id="Bubble Berry" class="unselected optional-item" src="images/icons/PaperMario_Items_BubbleBerry.png"></div>
    <div class="compact-misc-item compact-element blue-house-optional">
        <img data-item-name="Odd Key" id="Odd Key" class="unselected optional-item" src="images/icons/OddKey.gif">
        <div class="colorblind-label">O</div>
    </div>
    <div class="compact-element">
        <img data-chapter="7" id="Warehouse Key" class="unselected key-item" src="images/icons/OddKey.gif">
        <div class="colorblind-label">W</div>
    </div>
    <div class="compact-element"><img data-chapter="7" id="Scarf" class="unselected key-item" src="images/icons/Scarf.gif"></div>
    <div class="compact-element"><img data-chapter="7" id="Bucket" class="unselected key-item" src="images/icons/Bucket.png"></div>
    <div class="compact-element"><img data-chapter="7" id="Star Stone" class="unselected key-item" src="images/icons/StarStone_PM.png"></div>
    <div class="compact-misc-item compact-element">
        <img id="Blue Key" class="unselected optional-item" src="images/icons/PM_BlueKey.png">
        <div class="colorblind-label">B</div>
    </div>
    <div class="compact-element">
        <img data-chapter="7" id="Red Key" class="unselected key-item" src="images/icons/PM_Red_Key.png">
        <div class="colorblind-label">R</div>
    </div>
    <div class="compact-element"><img data-chapter="7" id="Palace Key" class="unselected key-item" src="images/icons/PM_Palace_Key.png"></div>
    <div id="BowsersKeySlot" class="compact-element">
        <img data-chapter-key="8" id="Bowser's Castle Key" class="unselected key-item" src="images/icons/PM_Bowser_Castle_Key.png">
        <br>
        <p data-chapter-key-count="8">0/5</p>
    </div>
    <div class="compact-misc-item compact-element useless-item">
        <img data-chapter-key="14" id="Prison Key" class="unselected optional-item" src="images/icons/OddKey.gif">
        <div class="colorblind-label" style="top:10px;">P</div>
        <p data-chapter-key-count="14">0/2</p>
    </div>
    <div class="compact-misc-item compact-element">
        <img id="Lyrics" class="unselected optional-item" src="images/koopa-koot-favors/Lyrics_PM.png">
        <div class="colorblind-label">L</div>
    </div>
    <div class="compact-misc-item compact-element">
        <img id="Melody" class="unselected optional-item" src="images/koopa-koot-favors/PM_Melody.png">
        <div class="colorblind-label">M</div>
    </div>
    <div class="compact-misc-item compact-element useless-item">
        <img data-chapter-key="9" id="Quizmo" class="unselected optional-item" src="images/icons/ChuckQuizmo_PM.png">
        <br>
        <p data-chapter-key-count="9">0/64</p>
    </div>
    <div class="compact-misc-item compact-element useless-item">
        <img data-chapter-key="11" id="Star Piece" class="unselected optional-item" src="images/icons/Star_Piece.png">
        <br>
        <p data-chapter-key-count="11">0/96</p>
    </div>
    <div class="compact-misc-item compact-element useless-item">
        <div class="tooltip">
            <img data-chapter-key="12" id="Rip Cheato" class="unselected optional-item" src="images/icons/RipCheato.png">
            <span class="tooltiptext rip-cheato-money">Total Coins Needed: 188 (Only first 6 can be progression items)</span>
        </div>
        <br>
        <p data-chapter-key-count="12">0/11</p>
    </div>
</div>`;
