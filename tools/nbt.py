"""Minimal Named Binary Tag (NBT) reader/writer.

Only what is needed for Minecraft structure templates: gzip-compressed,
big-endian, unnamed root compound. Python types map to tags as follows:

    dict  -> TAG_Compound        str   -> TAG_String
    Byte/Short/Int/Long/Float/Double wrappers -> numeric tags
    List(elem_type, items)       -> TAG_List
    IntArray                     -> TAG_Int_Array
"""

import gzip
import io
import struct

TAG_END, TAG_BYTE, TAG_SHORT, TAG_INT, TAG_LONG = 0, 1, 2, 3, 4
TAG_FLOAT, TAG_DOUBLE, TAG_BYTE_ARRAY, TAG_STRING = 5, 6, 7, 8
TAG_LIST, TAG_COMPOUND, TAG_INT_ARRAY, TAG_LONG_ARRAY = 9, 10, 11, 12


class Byte(int):
    tag = TAG_BYTE


class Short(int):
    tag = TAG_SHORT


class Int(int):
    tag = TAG_INT


class Long(int):
    tag = TAG_LONG


class Float(float):
    tag = TAG_FLOAT


class Double(float):
    tag = TAG_DOUBLE


class IntArray(list):
    tag = TAG_INT_ARRAY


class List(list):
    tag = TAG_LIST

    def __init__(self, elem_tag, items=()):
        super().__init__(items)
        self.elem_tag = elem_tag


def _tag_of(value):
    if isinstance(value, bool):
        return TAG_BYTE
    if hasattr(value, "tag"):
        return value.tag
    if isinstance(value, str):
        return TAG_STRING
    if isinstance(value, dict):
        return TAG_COMPOUND
    if isinstance(value, int):
        return TAG_INT
    if isinstance(value, float):
        return TAG_DOUBLE
    raise TypeError(f"cannot encode {type(value).__name__} as NBT")


def _write_string(out, s):
    data = s.encode("utf-8")
    out.write(struct.pack(">H", len(data)))
    out.write(data)


def _write_payload(out, tag, value):
    if tag == TAG_BYTE:
        out.write(struct.pack(">b", int(value)))
    elif tag == TAG_SHORT:
        out.write(struct.pack(">h", value))
    elif tag == TAG_INT:
        out.write(struct.pack(">i", value))
    elif tag == TAG_LONG:
        out.write(struct.pack(">q", value))
    elif tag == TAG_FLOAT:
        out.write(struct.pack(">f", value))
    elif tag == TAG_DOUBLE:
        out.write(struct.pack(">d", value))
    elif tag == TAG_STRING:
        _write_string(out, value)
    elif tag == TAG_LIST:
        elem_tag = value.elem_tag if len(value) else TAG_END
        out.write(struct.pack(">bi", elem_tag, len(value)))
        for item in value:
            if _tag_of(item) != elem_tag:
                raise TypeError("mixed element types in NBT list")
            _write_payload(out, elem_tag, item)
    elif tag == TAG_COMPOUND:
        for key, item in value.items():
            item_tag = _tag_of(item)
            out.write(struct.pack(">b", item_tag))
            _write_string(out, key)
            _write_payload(out, item_tag, item)
        out.write(struct.pack(">b", TAG_END))
    elif tag == TAG_INT_ARRAY:
        out.write(struct.pack(">i", len(value)))
        for item in value:
            out.write(struct.pack(">i", item))
    else:
        raise TypeError(f"unsupported tag {tag}")


def dumps(root):
    """Serialize a root compound to gzip-compressed NBT bytes."""
    raw = io.BytesIO()
    raw.write(struct.pack(">b", TAG_COMPOUND))
    _write_string(raw, "")
    _write_payload(raw, TAG_COMPOUND, root)
    out = io.BytesIO()
    # mtime=0 keeps the output byte-for-byte reproducible between builds.
    with gzip.GzipFile(fileobj=out, mode="wb", mtime=0) as gz:
        gz.write(raw.getvalue())
    return out.getvalue()


def _read_string(buf):
    (length,) = struct.unpack(">H", buf.read(2))
    return buf.read(length).decode("utf-8")


def _read_payload(buf, tag):
    if tag == TAG_BYTE:
        return Byte(struct.unpack(">b", buf.read(1))[0])
    if tag == TAG_SHORT:
        return Short(struct.unpack(">h", buf.read(2))[0])
    if tag == TAG_INT:
        return Int(struct.unpack(">i", buf.read(4))[0])
    if tag == TAG_LONG:
        return Long(struct.unpack(">q", buf.read(8))[0])
    if tag == TAG_FLOAT:
        return Float(struct.unpack(">f", buf.read(4))[0])
    if tag == TAG_DOUBLE:
        return Double(struct.unpack(">d", buf.read(8))[0])
    if tag == TAG_STRING:
        return _read_string(buf)
    if tag == TAG_LIST:
        elem_tag, length = struct.unpack(">bi", buf.read(5))
        return List(elem_tag, [_read_payload(buf, elem_tag) for _ in range(length)])
    if tag == TAG_COMPOUND:
        result = {}
        while True:
            (item_tag,) = struct.unpack(">b", buf.read(1))
            if item_tag == TAG_END:
                return result
            key = _read_string(buf)
            result[key] = _read_payload(buf, item_tag)
    if tag == TAG_INT_ARRAY:
        (length,) = struct.unpack(">i", buf.read(4))
        return IntArray(struct.unpack(f">{length}i", buf.read(4 * length)))
    raise TypeError(f"unsupported tag {tag}")


def loads(data):
    """Parse gzip-compressed NBT bytes into Python values."""
    buf = io.BytesIO(gzip.decompress(data))
    (tag,) = struct.unpack(">b", buf.read(1))
    if tag != TAG_COMPOUND:
        raise ValueError("root tag is not a compound")
    _read_string(buf)
    return _read_payload(buf, TAG_COMPOUND)
