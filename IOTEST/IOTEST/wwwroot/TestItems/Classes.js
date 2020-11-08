﻿
class SavedMap {
    constructor(objs, trgs) {
        this.Objects = objs;
        this.Triggers = trgs;

    }
    Objects;
    Triggers;

}
SavedMap.sObject = class {
    constructor(st, gr, ty, pos, vari, id, w) {
        this.State = st;
        this.Group = gr;
        this.Type = ty;
        this.Position = pos;
        this.Variant = vari;
        this.Id = id;
        this.Weight = w;
    }
    State;
    Group;
    Type;
    Position;
    Variant;
    Id;
    Weight;
}
SavedMap.sTrigger = class {

}
SavedMap.sObject.PositionT = class {
    constructor(x, y, z, s, r) {
        this.X = x;
        this.Y = y;
        this.Z = z;
        this.Size = s;
        this.Rotation = r;
    }
    X;
    Y;
    Z;
    Size;
    Rotation;
}
class VisualMap {
    constructor(smap) {
        smap.Objects.sort(function (x, y) { return x.Position.Z < y.Position.Z ? -1 : 1 })
        smap.Objects.forEach((e) => {
            switch (e.Group) {
                case "Electrons":
                    this.Objects.push(new ElectronsObjects(parseInt(e.Position.Size) / 100, parseInt(e.Position.X), parseInt(e.Position.Y), parseInt(e.Position.Rotation), ElectronsObjects.Types[e.Type], e.State == "Dynamic" ? true : false, e.Variant));
                    break;
                default:
                    console.error(e);
            }
        });

    }
    Work() {




    }
    Objects = [];
    Triggers = [];
}
class VisualTest {
    constructor(smap, display) {
        this.Canvas = display;
        this.VDisplay = new PIXI.Application({ width: 750, height: 500, view: this.Canvas , backgroundColor: 0xf0f0f0, antialias: true, })
        this.VDisplayContainer = new PIXI.Container();
        this.VDisplay.stage.addChild(this.VDisplayContainer);
        this.Vmap = new VisualMap(smap);
        this.Vmap.Objects.forEach((e) => this.VDisplayContainer.addChild(e.sprite));
        this.Vmap.Triggers.forEach((e) => container.addChild(e.graphics));
        this.VDisplay.ticker.add((delta) => this.TestWorker(delta));
        window.addEventListener('resize', () => { this.resize(this); });
        this.resize(this);
    }
    TrigerWorker() {
        this.Vmap.Triggers.forEach((e) => {
            e.Draw();
            var elementcount = 0;
            this.Vmap.Elements.forEach((el) => {
                if (e.magnetic) {
                    if (Funcs.pointInPoly(e.VectorArray, el.sprite.x, el.sprite.y)) {
                        elementcount++;
                    }
                }
                if (el.sprite.dragging) {
                    if (e.magnetic && Funcs.pointInPoly(e.VectorArray, el.sprite.hasposx, el.sprite.hasposy)) {
                        el.sprite.OnTrigger = true;
                        el.sprite.x = e.x;
                        el.sprite.y = e.y;
                    } else el.sprite.OnTrigger = false;
                }

            })
            e.elementcount = elementcount;
            // console.log(e.elementcount);
        });
    }
    TestWorker(delta) {
        this.TrigerWorker();
    }
    VDisplay;
    VDisplayContainer;
    Vmap;
    Canvas;
    Funcs = {
        getPointOfIntersection(startX1, startY1, endX1, endY1, startX2, startY2, endX2, endY2) {
            var d = (startX1 - endX1) * (endY2 - startY2) - (startY1 - endY1) * (endX2 - startX2);
            var da = (startX1 - startX2) * (endY2 - startY2) - (startY1 - startY2) * (endX2 - startX2);
            var db = (startX1 - endX1) * (startY1 - startY2) - (startY1 - endY1) * (startX1 - startX2);

            var ta = da / d;
            var tb = db / d;

            if (ta >= 0 && ta <= 1 && tb >= 0 && tb <= 1) {
                var dx = startX1 + ta * (endX1 - startX1);
                var dy = startY1 + ta * (endY1 - startY1);
                return [dx, dy];
            }
            return [-100, -100];
        },
        pointInPoly(poly, pointX, pointY) {
            var i, j, c = false;
            var polyCords = [[poly[0], poly[1]], [poly[2], poly[3]], [poly[4], poly[5]], [poly[6], poly[7]]];
            for (i = 0, j = polyCords.length - 1; i < polyCords.length; j = i++) {

                if (((polyCords[i][1] > pointY) != (polyCords[j][1] > pointY)) && (pointX < (polyCords[j][0] - polyCords[i][0]) * (pointY - polyCords[i][1]) / (polyCords[j][1] - polyCords[i][1]) + polyCords[i][0])) {
                    c = !c;
                }

            }

            return c;
        }
    }
    resize(t) {
        let TestWidth = document.getElementById("testMain").clientWidth;
        t.VDisplay.renderer.resize(TestWidth, TestWidth / 3 * 2);
        t.VDisplay.stage.scale.set(TestWidth / 900, TestWidth / 900);
    }
    destroy() {
        console.log("destroy");
        this.VDisplay.destroy();
        this.VDisplay = undefined;
        this.Vmap = undefined;
        this.Funcs = undefined;
        this.resize = undefined;
        this.VDisplayContainer = undefined;
    }
}

class DragableObject {
    static NullTexture = 'Prefabs/Shared/Null.png';
    constructor(img, scale, x, y, r, cc = true, drag = false) {
        this.texture = PIXI.Texture.from(img);
        this.sprite = new PIXI.Sprite(this.texture);
        this.sprite.x = x || 1;
        this.sprite.y = y || 1;
        this.sprite.scale.set(scale || 1);
        this.sprite.anchor.set(cc ? 0.5 : 0);
        this.sprite.interactive = drag;
        this.sprite.buttonMode = drag;
        this.sprite.rotation = Math.PI / 180 * r;
        this.sprite
            .on('pointerdown', this.onDragStart)
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('pointermove', this.onDragMove);
    }
    texture;
    sprite;
    onDragStart(event) {
        this.data = event.data;
        this.alpha = 0.5;
        this.dragging = true;
    }

    onDragEnd() {
        this.alpha = 1;
        this.dragging = false;
        this.data = null;
    }

    onDragMove() {
        if (this.dragging) {
            const newPosition = this.data.getLocalPosition(this.parent);
            this.hasposx = newPosition.x;
            this.hasposy = newPosition.y;
            if (!this.OnTrigger) {
                this.x = newPosition.x;
                this.y = newPosition.y;
            }

        }
    }

}
class ElectronsObjects extends DragableObject {
    static Types = {
        Resistor: {
            textures: ['TestItems/Prefabs/Electrons/Resistor.png']
        },
        Led: {
            textures: ['TestItems/Prefabs/Electrons/Led.png']
        },
        Battery: {
            textures: ['TestItems/Prefabs/Electrons/Galvanic.png']
        },
        Capacitor: {
            textures: ['TestItems/Prefabs/Electrons/Capacitor.png']
        },
        Wire: {
            textures: [
                'TestItems/Prefabs/Electrons/Wires/1.png',
                'TestItems/Prefabs/Electrons/Wires/2.png',
            ]
        },
        Reostat: {
            textures: ['TestItems/Prefabs/Electrons/Reostat.png']
        },
    }
    constructor(scale, x, y, r, type, isdragable, varitant) {
        var texture = type.textures[varitant];
        if (texture === undefined) texture = DragableObject.NullTexture;
        super(texture, scale, x, y, r, true, isdragable);
        this.type = type;
    }
    type;
}

class Trigger {
    constructor(Size, x, y, visual, magnetic) {
        this.magnetic = magnetic;
        this.x = x;
        this.y = y;
        this.visual = visual;
        this.Size = Size;
        this.elementcount = 0;
        this.VectorArray = [];
        this.VectorArray.push(this.x - this.Size, this.y - this.Size, this.x + this.Size, this.y - this.Size, this.x + this.Size, this.y + this.Size, this.x - this.Size, this.y + this.Size);
        this.graphics = new PIXI.Graphics();
    }
    Draw() {
        this.graphics.clear();
        this.VectorArray = [];
        this.VectorArray.push(this.x - this.Size, this.y - this.Size, this.x + this.Size, this.y - this.Size, this.x + this.Size, this.y + this.Size, this.x - this.Size, this.y + this.Size);
        this.graphics.lineStyle(0);
        this.graphics.beginFill(this.color, this.visual ? 0.5 : 0);
        this.graphics.drawPolygon(this.VectorArray);
        this.graphics.endFill();
    }
    color = 0x2600ff;
    graphics;
    VectorArray;
    x;
    y;
    Size;
    visual;
    elementcount;
}