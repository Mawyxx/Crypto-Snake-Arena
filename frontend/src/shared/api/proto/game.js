/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
import * as $protobuf from "protobufjs/minimal";

// Common aliases
const $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
const $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

export const game = $root.game = (() => {

    /**
     * Namespace game.
     * @exports game
     * @namespace
     */
    const game = {};

    game.WorldSnapshot = (function() {

        /**
         * Properties of a WorldSnapshot.
         * @memberof game
         * @interface IWorldSnapshot
         * @property {number|Long|null} [tick] WorldSnapshot tick
         * @property {Array.<game.ISnake>|null} [snakes] WorldSnapshot snakes
         * @property {Array.<game.ICoin>|null} [coins] WorldSnapshot coins
         */

        /**
         * Constructs a new WorldSnapshot.
         * @memberof game
         * @classdesc Represents a WorldSnapshot.
         * @implements IWorldSnapshot
         * @constructor
         * @param {game.IWorldSnapshot=} [properties] Properties to set
         */
        function WorldSnapshot(properties) {
            this.snakes = [];
            this.coins = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * WorldSnapshot tick.
         * @member {number|Long} tick
         * @memberof game.WorldSnapshot
         * @instance
         */
        WorldSnapshot.prototype.tick = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * WorldSnapshot snakes.
         * @member {Array.<game.ISnake>} snakes
         * @memberof game.WorldSnapshot
         * @instance
         */
        WorldSnapshot.prototype.snakes = $util.emptyArray;

        /**
         * WorldSnapshot coins.
         * @member {Array.<game.ICoin>} coins
         * @memberof game.WorldSnapshot
         * @instance
         */
        WorldSnapshot.prototype.coins = $util.emptyArray;

        /**
         * Creates a new WorldSnapshot instance using the specified properties.
         * @function create
         * @memberof game.WorldSnapshot
         * @static
         * @param {game.IWorldSnapshot=} [properties] Properties to set
         * @returns {game.WorldSnapshot} WorldSnapshot instance
         */
        WorldSnapshot.create = function create(properties) {
            return new WorldSnapshot(properties);
        };

        /**
         * Encodes the specified WorldSnapshot message. Does not implicitly {@link game.WorldSnapshot.verify|verify} messages.
         * @function encode
         * @memberof game.WorldSnapshot
         * @static
         * @param {game.IWorldSnapshot} message WorldSnapshot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorldSnapshot.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.tick != null && Object.hasOwnProperty.call(message, "tick"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.tick);
            if (message.snakes != null && message.snakes.length)
                for (let i = 0; i < message.snakes.length; ++i)
                    $root.game.Snake.encode(message.snakes[i], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.coins != null && message.coins.length)
                for (let i = 0; i < message.coins.length; ++i)
                    $root.game.Coin.encode(message.coins[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            return writer;
        };

        /**
         * Encodes the specified WorldSnapshot message, length delimited. Does not implicitly {@link game.WorldSnapshot.verify|verify} messages.
         * @function encodeDelimited
         * @memberof game.WorldSnapshot
         * @static
         * @param {game.IWorldSnapshot} message WorldSnapshot message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        WorldSnapshot.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a WorldSnapshot message from the specified reader or buffer.
         * @function decode
         * @memberof game.WorldSnapshot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {game.WorldSnapshot} WorldSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorldSnapshot.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.game.WorldSnapshot();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.tick = reader.uint64();
                        break;
                    }
                case 2: {
                        if (!(message.snakes && message.snakes.length))
                            message.snakes = [];
                        message.snakes.push($root.game.Snake.decode(reader, reader.uint32()));
                        break;
                    }
                case 3: {
                        if (!(message.coins && message.coins.length))
                            message.coins = [];
                        message.coins.push($root.game.Coin.decode(reader, reader.uint32()));
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a WorldSnapshot message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof game.WorldSnapshot
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {game.WorldSnapshot} WorldSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        WorldSnapshot.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a WorldSnapshot message.
         * @function verify
         * @memberof game.WorldSnapshot
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        WorldSnapshot.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.tick != null && message.hasOwnProperty("tick"))
                if (!$util.isInteger(message.tick) && !(message.tick && $util.isInteger(message.tick.low) && $util.isInteger(message.tick.high)))
                    return "tick: integer|Long expected";
            if (message.snakes != null && message.hasOwnProperty("snakes")) {
                if (!Array.isArray(message.snakes))
                    return "snakes: array expected";
                for (let i = 0; i < message.snakes.length; ++i) {
                    let error = $root.game.Snake.verify(message.snakes[i]);
                    if (error)
                        return "snakes." + error;
                }
            }
            if (message.coins != null && message.hasOwnProperty("coins")) {
                if (!Array.isArray(message.coins))
                    return "coins: array expected";
                for (let i = 0; i < message.coins.length; ++i) {
                    let error = $root.game.Coin.verify(message.coins[i]);
                    if (error)
                        return "coins." + error;
                }
            }
            return null;
        };

        /**
         * Creates a WorldSnapshot message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof game.WorldSnapshot
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {game.WorldSnapshot} WorldSnapshot
         */
        WorldSnapshot.fromObject = function fromObject(object) {
            if (object instanceof $root.game.WorldSnapshot)
                return object;
            let message = new $root.game.WorldSnapshot();
            if (object.tick != null)
                if ($util.Long)
                    (message.tick = $util.Long.fromValue(object.tick)).unsigned = true;
                else if (typeof object.tick === "string")
                    message.tick = parseInt(object.tick, 10);
                else if (typeof object.tick === "number")
                    message.tick = object.tick;
                else if (typeof object.tick === "object")
                    message.tick = new $util.LongBits(object.tick.low >>> 0, object.tick.high >>> 0).toNumber(true);
            if (object.snakes) {
                if (!Array.isArray(object.snakes))
                    throw TypeError(".game.WorldSnapshot.snakes: array expected");
                message.snakes = [];
                for (let i = 0; i < object.snakes.length; ++i) {
                    if (typeof object.snakes[i] !== "object")
                        throw TypeError(".game.WorldSnapshot.snakes: object expected");
                    message.snakes[i] = $root.game.Snake.fromObject(object.snakes[i]);
                }
            }
            if (object.coins) {
                if (!Array.isArray(object.coins))
                    throw TypeError(".game.WorldSnapshot.coins: array expected");
                message.coins = [];
                for (let i = 0; i < object.coins.length; ++i) {
                    if (typeof object.coins[i] !== "object")
                        throw TypeError(".game.WorldSnapshot.coins: object expected");
                    message.coins[i] = $root.game.Coin.fromObject(object.coins[i]);
                }
            }
            return message;
        };

        /**
         * Creates a plain object from a WorldSnapshot message. Also converts values to other types if specified.
         * @function toObject
         * @memberof game.WorldSnapshot
         * @static
         * @param {game.WorldSnapshot} message WorldSnapshot
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        WorldSnapshot.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults) {
                object.snakes = [];
                object.coins = [];
            }
            if (options.defaults)
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.tick = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.tick = options.longs === String ? "0" : 0;
            if (message.tick != null && message.hasOwnProperty("tick"))
                if (typeof message.tick === "number")
                    object.tick = options.longs === String ? String(message.tick) : message.tick;
                else
                    object.tick = options.longs === String ? $util.Long.prototype.toString.call(message.tick) : options.longs === Number ? new $util.LongBits(message.tick.low >>> 0, message.tick.high >>> 0).toNumber(true) : message.tick;
            if (message.snakes && message.snakes.length) {
                object.snakes = [];
                for (let j = 0; j < message.snakes.length; ++j)
                    object.snakes[j] = $root.game.Snake.toObject(message.snakes[j], options);
            }
            if (message.coins && message.coins.length) {
                object.coins = [];
                for (let j = 0; j < message.coins.length; ++j)
                    object.coins[j] = $root.game.Coin.toObject(message.coins[j], options);
            }
            return object;
        };

        /**
         * Converts this WorldSnapshot to JSON.
         * @function toJSON
         * @memberof game.WorldSnapshot
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        WorldSnapshot.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for WorldSnapshot
         * @function getTypeUrl
         * @memberof game.WorldSnapshot
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        WorldSnapshot.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/game.WorldSnapshot";
        };

        return WorldSnapshot;
    })();

    game.Snake = (function() {

        /**
         * Properties of a Snake.
         * @memberof game
         * @interface ISnake
         * @property {number|Long|null} [id] Snake id
         * @property {game.IPoint|null} [head] Snake head
         * @property {Array.<game.IPoint>|null} [body] Snake body
         * @property {number|null} [angle] Snake angle
         * @property {number|null} [score] Snake score
         */

        /**
         * Constructs a new Snake.
         * @memberof game
         * @classdesc Represents a Snake.
         * @implements ISnake
         * @constructor
         * @param {game.ISnake=} [properties] Properties to set
         */
        function Snake(properties) {
            this.body = [];
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Snake id.
         * @member {number|Long} id
         * @memberof game.Snake
         * @instance
         */
        Snake.prototype.id = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Snake head.
         * @member {game.IPoint|null|undefined} head
         * @memberof game.Snake
         * @instance
         */
        Snake.prototype.head = null;

        /**
         * Snake body.
         * @member {Array.<game.IPoint>} body
         * @memberof game.Snake
         * @instance
         */
        Snake.prototype.body = $util.emptyArray;

        /**
         * Snake angle.
         * @member {number} angle
         * @memberof game.Snake
         * @instance
         */
        Snake.prototype.angle = 0;

        /**
         * Snake score.
         * @member {number} score
         * @memberof game.Snake
         * @instance
         */
        Snake.prototype.score = 0;

        /**
         * Creates a new Snake instance using the specified properties.
         * @function create
         * @memberof game.Snake
         * @static
         * @param {game.ISnake=} [properties] Properties to set
         * @returns {game.Snake} Snake instance
         */
        Snake.create = function create(properties) {
            return new Snake(properties);
        };

        /**
         * Encodes the specified Snake message. Does not implicitly {@link game.Snake.verify|verify} messages.
         * @function encode
         * @memberof game.Snake
         * @static
         * @param {game.ISnake} message Snake message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Snake.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.id);
            if (message.head != null && Object.hasOwnProperty.call(message, "head"))
                $root.game.Point.encode(message.head, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.body != null && message.body.length)
                for (let i = 0; i < message.body.length; ++i)
                    $root.game.Point.encode(message.body[i], writer.uint32(/* id 3, wireType 2 =*/26).fork()).ldelim();
            if (message.angle != null && Object.hasOwnProperty.call(message, "angle"))
                writer.uint32(/* id 4, wireType 5 =*/37).float(message.angle);
            if (message.score != null && Object.hasOwnProperty.call(message, "score"))
                writer.uint32(/* id 5, wireType 5 =*/45).float(message.score);
            return writer;
        };

        /**
         * Encodes the specified Snake message, length delimited. Does not implicitly {@link game.Snake.verify|verify} messages.
         * @function encodeDelimited
         * @memberof game.Snake
         * @static
         * @param {game.ISnake} message Snake message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Snake.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Snake message from the specified reader or buffer.
         * @function decode
         * @memberof game.Snake
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {game.Snake} Snake
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Snake.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.game.Snake();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.uint64();
                        break;
                    }
                case 2: {
                        message.head = $root.game.Point.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        if (!(message.body && message.body.length))
                            message.body = [];
                        message.body.push($root.game.Point.decode(reader, reader.uint32()));
                        break;
                    }
                case 4: {
                        message.angle = reader.float();
                        break;
                    }
                case 5: {
                        message.score = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Snake message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof game.Snake
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {game.Snake} Snake
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Snake.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Snake message.
         * @function verify
         * @memberof game.Snake
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Snake.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.head != null && message.hasOwnProperty("head")) {
                let error = $root.game.Point.verify(message.head);
                if (error)
                    return "head." + error;
            }
            if (message.body != null && message.hasOwnProperty("body")) {
                if (!Array.isArray(message.body))
                    return "body: array expected";
                for (let i = 0; i < message.body.length; ++i) {
                    let error = $root.game.Point.verify(message.body[i]);
                    if (error)
                        return "body." + error;
                }
            }
            if (message.angle != null && message.hasOwnProperty("angle"))
                if (typeof message.angle !== "number")
                    return "angle: number expected";
            if (message.score != null && message.hasOwnProperty("score"))
                if (typeof message.score !== "number")
                    return "score: number expected";
            return null;
        };

        /**
         * Creates a Snake message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof game.Snake
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {game.Snake} Snake
         */
        Snake.fromObject = function fromObject(object) {
            if (object instanceof $root.game.Snake)
                return object;
            let message = new $root.game.Snake();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = true;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber(true);
            if (object.head != null) {
                if (typeof object.head !== "object")
                    throw TypeError(".game.Snake.head: object expected");
                message.head = $root.game.Point.fromObject(object.head);
            }
            if (object.body) {
                if (!Array.isArray(object.body))
                    throw TypeError(".game.Snake.body: array expected");
                message.body = [];
                for (let i = 0; i < object.body.length; ++i) {
                    if (typeof object.body[i] !== "object")
                        throw TypeError(".game.Snake.body: object expected");
                    message.body[i] = $root.game.Point.fromObject(object.body[i]);
                }
            }
            if (object.angle != null)
                message.angle = Number(object.angle);
            if (object.score != null)
                message.score = Number(object.score);
            return message;
        };

        /**
         * Creates a plain object from a Snake message. Also converts values to other types if specified.
         * @function toObject
         * @memberof game.Snake
         * @static
         * @param {game.Snake} message Snake
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Snake.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.arrays || options.defaults)
                object.body = [];
            if (options.defaults) {
                if ($util.Long) {
                    let long = new $util.Long(0, 0, true);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.head = null;
                object.angle = 0;
                object.score = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber(true) : message.id;
            if (message.head != null && message.hasOwnProperty("head"))
                object.head = $root.game.Point.toObject(message.head, options);
            if (message.body && message.body.length) {
                object.body = [];
                for (let j = 0; j < message.body.length; ++j)
                    object.body[j] = $root.game.Point.toObject(message.body[j], options);
            }
            if (message.angle != null && message.hasOwnProperty("angle"))
                object.angle = options.json && !isFinite(message.angle) ? String(message.angle) : message.angle;
            if (message.score != null && message.hasOwnProperty("score"))
                object.score = options.json && !isFinite(message.score) ? String(message.score) : message.score;
            return object;
        };

        /**
         * Converts this Snake to JSON.
         * @function toJSON
         * @memberof game.Snake
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Snake.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Snake
         * @function getTypeUrl
         * @memberof game.Snake
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Snake.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/game.Snake";
        };

        return Snake;
    })();

    game.Coin = (function() {

        /**
         * Properties of a Coin.
         * @memberof game
         * @interface ICoin
         * @property {string|null} [id] Coin id
         * @property {game.IPoint|null} [pos] Coin pos
         * @property {number|null} [value] Coin value
         */

        /**
         * Constructs a new Coin.
         * @memberof game
         * @classdesc Represents a Coin.
         * @implements ICoin
         * @constructor
         * @param {game.ICoin=} [properties] Properties to set
         */
        function Coin(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Coin id.
         * @member {string} id
         * @memberof game.Coin
         * @instance
         */
        Coin.prototype.id = "";

        /**
         * Coin pos.
         * @member {game.IPoint|null|undefined} pos
         * @memberof game.Coin
         * @instance
         */
        Coin.prototype.pos = null;

        /**
         * Coin value.
         * @member {number} value
         * @memberof game.Coin
         * @instance
         */
        Coin.prototype.value = 0;

        /**
         * Creates a new Coin instance using the specified properties.
         * @function create
         * @memberof game.Coin
         * @static
         * @param {game.ICoin=} [properties] Properties to set
         * @returns {game.Coin} Coin instance
         */
        Coin.create = function create(properties) {
            return new Coin(properties);
        };

        /**
         * Encodes the specified Coin message. Does not implicitly {@link game.Coin.verify|verify} messages.
         * @function encode
         * @memberof game.Coin
         * @static
         * @param {game.ICoin} message Coin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Coin.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 2 =*/10).string(message.id);
            if (message.pos != null && Object.hasOwnProperty.call(message, "pos"))
                $root.game.Point.encode(message.pos, writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim();
            if (message.value != null && Object.hasOwnProperty.call(message, "value"))
                writer.uint32(/* id 3, wireType 5 =*/29).float(message.value);
            return writer;
        };

        /**
         * Encodes the specified Coin message, length delimited. Does not implicitly {@link game.Coin.verify|verify} messages.
         * @function encodeDelimited
         * @memberof game.Coin
         * @static
         * @param {game.ICoin} message Coin message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Coin.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @function decode
         * @memberof game.Coin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {game.Coin} Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Coin.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.game.Coin();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.id = reader.string();
                        break;
                    }
                case 2: {
                        message.pos = $root.game.Point.decode(reader, reader.uint32());
                        break;
                    }
                case 3: {
                        message.value = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Coin message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof game.Coin
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {game.Coin} Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Coin.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Coin message.
         * @function verify
         * @memberof game.Coin
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Coin.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isString(message.id))
                    return "id: string expected";
            if (message.pos != null && message.hasOwnProperty("pos")) {
                let error = $root.game.Point.verify(message.pos);
                if (error)
                    return "pos." + error;
            }
            if (message.value != null && message.hasOwnProperty("value"))
                if (typeof message.value !== "number")
                    return "value: number expected";
            return null;
        };

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof game.Coin
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {game.Coin} Coin
         */
        Coin.fromObject = function fromObject(object) {
            if (object instanceof $root.game.Coin)
                return object;
            let message = new $root.game.Coin();
            if (object.id != null)
                message.id = String(object.id);
            if (object.pos != null) {
                if (typeof object.pos !== "object")
                    throw TypeError(".game.Coin.pos: object expected");
                message.pos = $root.game.Point.fromObject(object.pos);
            }
            if (object.value != null)
                message.value = Number(object.value);
            return message;
        };

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @function toObject
         * @memberof game.Coin
         * @static
         * @param {game.Coin} message Coin
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Coin.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.id = "";
                object.pos = null;
                object.value = 0;
            }
            if (message.id != null && message.hasOwnProperty("id"))
                object.id = message.id;
            if (message.pos != null && message.hasOwnProperty("pos"))
                object.pos = $root.game.Point.toObject(message.pos, options);
            if (message.value != null && message.hasOwnProperty("value"))
                object.value = options.json && !isFinite(message.value) ? String(message.value) : message.value;
            return object;
        };

        /**
         * Converts this Coin to JSON.
         * @function toJSON
         * @memberof game.Coin
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Coin.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Coin
         * @function getTypeUrl
         * @memberof game.Coin
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Coin.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/game.Coin";
        };

        return Coin;
    })();

    game.Point = (function() {

        /**
         * Properties of a Point.
         * @memberof game
         * @interface IPoint
         * @property {number|null} [x] Point x
         * @property {number|null} [y] Point y
         */

        /**
         * Constructs a new Point.
         * @memberof game
         * @classdesc Represents a Point.
         * @implements IPoint
         * @constructor
         * @param {game.IPoint=} [properties] Properties to set
         */
        function Point(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Point x.
         * @member {number} x
         * @memberof game.Point
         * @instance
         */
        Point.prototype.x = 0;

        /**
         * Point y.
         * @member {number} y
         * @memberof game.Point
         * @instance
         */
        Point.prototype.y = 0;

        /**
         * Creates a new Point instance using the specified properties.
         * @function create
         * @memberof game.Point
         * @static
         * @param {game.IPoint=} [properties] Properties to set
         * @returns {game.Point} Point instance
         */
        Point.create = function create(properties) {
            return new Point(properties);
        };

        /**
         * Encodes the specified Point message. Does not implicitly {@link game.Point.verify|verify} messages.
         * @function encode
         * @memberof game.Point
         * @static
         * @param {game.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Point.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.x != null && Object.hasOwnProperty.call(message, "x"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.x);
            if (message.y != null && Object.hasOwnProperty.call(message, "y"))
                writer.uint32(/* id 2, wireType 5 =*/21).float(message.y);
            return writer;
        };

        /**
         * Encodes the specified Point message, length delimited. Does not implicitly {@link game.Point.verify|verify} messages.
         * @function encodeDelimited
         * @memberof game.Point
         * @static
         * @param {game.IPoint} message Point message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Point.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Point message from the specified reader or buffer.
         * @function decode
         * @memberof game.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {game.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Point.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.game.Point();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.x = reader.float();
                        break;
                    }
                case 2: {
                        message.y = reader.float();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Point message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof game.Point
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {game.Point} Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Point.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Point message.
         * @function verify
         * @memberof game.Point
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Point.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.x != null && message.hasOwnProperty("x"))
                if (typeof message.x !== "number")
                    return "x: number expected";
            if (message.y != null && message.hasOwnProperty("y"))
                if (typeof message.y !== "number")
                    return "y: number expected";
            return null;
        };

        /**
         * Creates a Point message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof game.Point
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {game.Point} Point
         */
        Point.fromObject = function fromObject(object) {
            if (object instanceof $root.game.Point)
                return object;
            let message = new $root.game.Point();
            if (object.x != null)
                message.x = Number(object.x);
            if (object.y != null)
                message.y = Number(object.y);
            return message;
        };

        /**
         * Creates a plain object from a Point message. Also converts values to other types if specified.
         * @function toObject
         * @memberof game.Point
         * @static
         * @param {game.Point} message Point
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Point.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.x = 0;
                object.y = 0;
            }
            if (message.x != null && message.hasOwnProperty("x"))
                object.x = options.json && !isFinite(message.x) ? String(message.x) : message.x;
            if (message.y != null && message.hasOwnProperty("y"))
                object.y = options.json && !isFinite(message.y) ? String(message.y) : message.y;
            return object;
        };

        /**
         * Converts this Point to JSON.
         * @function toJSON
         * @memberof game.Point
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Point.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for Point
         * @function getTypeUrl
         * @memberof game.Point
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        Point.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/game.Point";
        };

        return Point;
    })();

    game.PlayerInput = (function() {

        /**
         * Properties of a PlayerInput.
         * @memberof game
         * @interface IPlayerInput
         * @property {number|null} [angle] PlayerInput angle
         * @property {boolean|null} [boost] PlayerInput boost
         */

        /**
         * Constructs a new PlayerInput.
         * @memberof game
         * @classdesc Represents a PlayerInput.
         * @implements IPlayerInput
         * @constructor
         * @param {game.IPlayerInput=} [properties] Properties to set
         */
        function PlayerInput(properties) {
            if (properties)
                for (let keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * PlayerInput angle.
         * @member {number} angle
         * @memberof game.PlayerInput
         * @instance
         */
        PlayerInput.prototype.angle = 0;

        /**
         * PlayerInput boost.
         * @member {boolean} boost
         * @memberof game.PlayerInput
         * @instance
         */
        PlayerInput.prototype.boost = false;

        /**
         * Creates a new PlayerInput instance using the specified properties.
         * @function create
         * @memberof game.PlayerInput
         * @static
         * @param {game.IPlayerInput=} [properties] Properties to set
         * @returns {game.PlayerInput} PlayerInput instance
         */
        PlayerInput.create = function create(properties) {
            return new PlayerInput(properties);
        };

        /**
         * Encodes the specified PlayerInput message. Does not implicitly {@link game.PlayerInput.verify|verify} messages.
         * @function encode
         * @memberof game.PlayerInput
         * @static
         * @param {game.IPlayerInput} message PlayerInput message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerInput.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.angle != null && Object.hasOwnProperty.call(message, "angle"))
                writer.uint32(/* id 1, wireType 5 =*/13).float(message.angle);
            if (message.boost != null && Object.hasOwnProperty.call(message, "boost"))
                writer.uint32(/* id 2, wireType 0 =*/16).bool(message.boost);
            return writer;
        };

        /**
         * Encodes the specified PlayerInput message, length delimited. Does not implicitly {@link game.PlayerInput.verify|verify} messages.
         * @function encodeDelimited
         * @memberof game.PlayerInput
         * @static
         * @param {game.IPlayerInput} message PlayerInput message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        PlayerInput.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a PlayerInput message from the specified reader or buffer.
         * @function decode
         * @memberof game.PlayerInput
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {game.PlayerInput} PlayerInput
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerInput.decode = function decode(reader, length, error) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            let end = length === undefined ? reader.len : reader.pos + length, message = new $root.game.PlayerInput();
            while (reader.pos < end) {
                let tag = reader.uint32();
                if (tag === error)
                    break;
                switch (tag >>> 3) {
                case 1: {
                        message.angle = reader.float();
                        break;
                    }
                case 2: {
                        message.boost = reader.bool();
                        break;
                    }
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a PlayerInput message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof game.PlayerInput
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {game.PlayerInput} PlayerInput
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        PlayerInput.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a PlayerInput message.
         * @function verify
         * @memberof game.PlayerInput
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        PlayerInput.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.angle != null && message.hasOwnProperty("angle"))
                if (typeof message.angle !== "number")
                    return "angle: number expected";
            if (message.boost != null && message.hasOwnProperty("boost"))
                if (typeof message.boost !== "boolean")
                    return "boost: boolean expected";
            return null;
        };

        /**
         * Creates a PlayerInput message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof game.PlayerInput
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {game.PlayerInput} PlayerInput
         */
        PlayerInput.fromObject = function fromObject(object) {
            if (object instanceof $root.game.PlayerInput)
                return object;
            let message = new $root.game.PlayerInput();
            if (object.angle != null)
                message.angle = Number(object.angle);
            if (object.boost != null)
                message.boost = Boolean(object.boost);
            return message;
        };

        /**
         * Creates a plain object from a PlayerInput message. Also converts values to other types if specified.
         * @function toObject
         * @memberof game.PlayerInput
         * @static
         * @param {game.PlayerInput} message PlayerInput
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        PlayerInput.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            let object = {};
            if (options.defaults) {
                object.angle = 0;
                object.boost = false;
            }
            if (message.angle != null && message.hasOwnProperty("angle"))
                object.angle = options.json && !isFinite(message.angle) ? String(message.angle) : message.angle;
            if (message.boost != null && message.hasOwnProperty("boost"))
                object.boost = message.boost;
            return object;
        };

        /**
         * Converts this PlayerInput to JSON.
         * @function toJSON
         * @memberof game.PlayerInput
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        PlayerInput.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        /**
         * Gets the default type url for PlayerInput
         * @function getTypeUrl
         * @memberof game.PlayerInput
         * @static
         * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns {string} The default type url
         */
        PlayerInput.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
            if (typeUrlPrefix === undefined) {
                typeUrlPrefix = "type.googleapis.com";
            }
            return typeUrlPrefix + "/game.PlayerInput";
        };

        return PlayerInput;
    })();

    return game;
})();

export { $root as default };
