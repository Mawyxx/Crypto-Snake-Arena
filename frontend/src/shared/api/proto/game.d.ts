import * as $protobuf from "protobufjs";
import Long = require("long");
/** Namespace game. */
export namespace game {

    /** Properties of a WorldSnapshot. */
    interface IWorldSnapshot {

        /** WorldSnapshot tick */
        tick?: (number|Long|null);

        /** WorldSnapshot snakes */
        snakes?: (game.ISnake[]|null);

        /** WorldSnapshot coins */
        coins?: (game.ICoin[]|null);
    }

    /** Represents a WorldSnapshot. */
    class WorldSnapshot implements IWorldSnapshot {

        /**
         * Constructs a new WorldSnapshot.
         * @param [properties] Properties to set
         */
        constructor(properties?: game.IWorldSnapshot);

        /** WorldSnapshot tick. */
        public tick: (number|Long);

        /** WorldSnapshot snakes. */
        public snakes: game.ISnake[];

        /** WorldSnapshot coins. */
        public coins: game.ICoin[];

        /**
         * Creates a new WorldSnapshot instance using the specified properties.
         * @param [properties] Properties to set
         * @returns WorldSnapshot instance
         */
        public static create(properties?: game.IWorldSnapshot): game.WorldSnapshot;

        /**
         * Encodes the specified WorldSnapshot message. Does not implicitly {@link game.WorldSnapshot.verify|verify} messages.
         * @param message WorldSnapshot message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: game.IWorldSnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified WorldSnapshot message, length delimited. Does not implicitly {@link game.WorldSnapshot.verify|verify} messages.
         * @param message WorldSnapshot message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: game.IWorldSnapshot, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a WorldSnapshot message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns WorldSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): game.WorldSnapshot;

        /**
         * Decodes a WorldSnapshot message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns WorldSnapshot
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): game.WorldSnapshot;

        /**
         * Verifies a WorldSnapshot message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a WorldSnapshot message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns WorldSnapshot
         */
        public static fromObject(object: { [k: string]: any }): game.WorldSnapshot;

        /**
         * Creates a plain object from a WorldSnapshot message. Also converts values to other types if specified.
         * @param message WorldSnapshot
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: game.WorldSnapshot, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this WorldSnapshot to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for WorldSnapshot
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Snake. */
    interface ISnake {

        /** Snake id */
        id?: (number|Long|null);

        /** Snake head */
        head?: (game.IPoint|null);

        /** Snake body */
        body?: (game.IPoint[]|null);

        /** Snake angle */
        angle?: (number|null);

        /** Snake score */
        score?: (number|null);

        /** Snake bodyLength */
        bodyLength?: (number|null);
    }

    /** Represents a Snake. */
    class Snake implements ISnake {

        /**
         * Constructs a new Snake.
         * @param [properties] Properties to set
         */
        constructor(properties?: game.ISnake);

        /** Snake id. */
        public id: (number|Long);

        /** Snake head. */
        public head?: (game.IPoint|null);

        /** Snake body. */
        public body: game.IPoint[];

        /** Snake angle. */
        public angle: number;

        /** Snake score. */
        public score: number;

        /** Snake bodyLength. */
        public bodyLength: number;

        /**
         * Creates a new Snake instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Snake instance
         */
        public static create(properties?: game.ISnake): game.Snake;

        /**
         * Encodes the specified Snake message. Does not implicitly {@link game.Snake.verify|verify} messages.
         * @param message Snake message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: game.ISnake, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Snake message, length delimited. Does not implicitly {@link game.Snake.verify|verify} messages.
         * @param message Snake message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: game.ISnake, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Snake message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Snake
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): game.Snake;

        /**
         * Decodes a Snake message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Snake
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): game.Snake;

        /**
         * Verifies a Snake message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Snake message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Snake
         */
        public static fromObject(object: { [k: string]: any }): game.Snake;

        /**
         * Creates a plain object from a Snake message. Also converts values to other types if specified.
         * @param message Snake
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: game.Snake, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Snake to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Snake
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Coin. */
    interface ICoin {

        /** Coin id */
        id?: (string|null);

        /** Coin pos */
        pos?: (game.IPoint|null);

        /** Coin value */
        value?: (number|null);
    }

    /** Represents a Coin. */
    class Coin implements ICoin {

        /**
         * Constructs a new Coin.
         * @param [properties] Properties to set
         */
        constructor(properties?: game.ICoin);

        /** Coin id. */
        public id: string;

        /** Coin pos. */
        public pos?: (game.IPoint|null);

        /** Coin value. */
        public value: number;

        /**
         * Creates a new Coin instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Coin instance
         */
        public static create(properties?: game.ICoin): game.Coin;

        /**
         * Encodes the specified Coin message. Does not implicitly {@link game.Coin.verify|verify} messages.
         * @param message Coin message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: game.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Coin message, length delimited. Does not implicitly {@link game.Coin.verify|verify} messages.
         * @param message Coin message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: game.ICoin, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Coin message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): game.Coin;

        /**
         * Decodes a Coin message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Coin
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): game.Coin;

        /**
         * Verifies a Coin message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Coin message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Coin
         */
        public static fromObject(object: { [k: string]: any }): game.Coin;

        /**
         * Creates a plain object from a Coin message. Also converts values to other types if specified.
         * @param message Coin
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: game.Coin, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Coin to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Coin
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a Point. */
    interface IPoint {

        /** Point x */
        x?: (number|null);

        /** Point y */
        y?: (number|null);
    }

    /** Represents a Point. */
    class Point implements IPoint {

        /**
         * Constructs a new Point.
         * @param [properties] Properties to set
         */
        constructor(properties?: game.IPoint);

        /** Point x. */
        public x: number;

        /** Point y. */
        public y: number;

        /**
         * Creates a new Point instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Point instance
         */
        public static create(properties?: game.IPoint): game.Point;

        /**
         * Encodes the specified Point message. Does not implicitly {@link game.Point.verify|verify} messages.
         * @param message Point message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: game.IPoint, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Point message, length delimited. Does not implicitly {@link game.Point.verify|verify} messages.
         * @param message Point message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: game.IPoint, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Point message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): game.Point;

        /**
         * Decodes a Point message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Point
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): game.Point;

        /**
         * Verifies a Point message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Point message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Point
         */
        public static fromObject(object: { [k: string]: any }): game.Point;

        /**
         * Creates a plain object from a Point message. Also converts values to other types if specified.
         * @param message Point
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: game.Point, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Point to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for Point
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }

    /** Properties of a PlayerInput. */
    interface IPlayerInput {

        /** PlayerInput angle */
        angle?: (number|null);

        /** PlayerInput boost */
        boost?: (boolean|null);
    }

    /** Represents a PlayerInput. */
    class PlayerInput implements IPlayerInput {

        /**
         * Constructs a new PlayerInput.
         * @param [properties] Properties to set
         */
        constructor(properties?: game.IPlayerInput);

        /** PlayerInput angle. */
        public angle: number;

        /** PlayerInput boost. */
        public boost: boolean;

        /**
         * Creates a new PlayerInput instance using the specified properties.
         * @param [properties] Properties to set
         * @returns PlayerInput instance
         */
        public static create(properties?: game.IPlayerInput): game.PlayerInput;

        /**
         * Encodes the specified PlayerInput message. Does not implicitly {@link game.PlayerInput.verify|verify} messages.
         * @param message PlayerInput message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: game.IPlayerInput, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified PlayerInput message, length delimited. Does not implicitly {@link game.PlayerInput.verify|verify} messages.
         * @param message PlayerInput message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: game.IPlayerInput, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a PlayerInput message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns PlayerInput
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): game.PlayerInput;

        /**
         * Decodes a PlayerInput message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns PlayerInput
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): game.PlayerInput;

        /**
         * Verifies a PlayerInput message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a PlayerInput message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns PlayerInput
         */
        public static fromObject(object: { [k: string]: any }): game.PlayerInput;

        /**
         * Creates a plain object from a PlayerInput message. Also converts values to other types if specified.
         * @param message PlayerInput
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: game.PlayerInput, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this PlayerInput to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };

        /**
         * Gets the default type url for PlayerInput
         * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
         * @returns The default type url
         */
        public static getTypeUrl(typeUrlPrefix?: string): string;
    }
}
