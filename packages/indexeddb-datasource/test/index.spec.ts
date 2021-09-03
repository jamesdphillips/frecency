import { initDB } from "../src";

//global.IDBKeyRange = require("fake-indexeddb/build/FDBKeyRange");
//global.indexedDB = require("fake-indexeddb/build/fakeIndexedDB");

describe('initDB', () => {
  it("should instantiate a datasource", () => {
    expect(initDB("test")).toBeTruthy();
  });
});

describe('datasource', () => {
  it("should be able to add visits", async () => {
    const ds = initDB(Math.random().toLocaleString());
    expect(await ds.visit("path", "key")).toBeUndefined();
    expect(await ds.list("path")).toHaveLength(1);
  });
  it("should be able to clear visits", async () => {
    const ds = initDB(Math.random().toLocaleString());
    await Promise.all([
      ds.visit("path", "one"),
      ds.visit("path", "two"),
      ds.visit("path", "two"),
      ds.visit("path", "two"),
    ]);
    expect(await ds.clear("path")).toBeUndefined();
    expect(await ds.list("path")).toHaveLength(0);
  });
  it("should be able to list keys", async () => {
    const ds = initDB(Math.random().toLocaleString());
    expect(await ds.list("my-path")).toHaveLength(0);
    await Promise.all([
      ds.visit("my-path", "one"),
      ds.visit("my-path", "two"),
      ds.visit("my-path", "two"),
      ds.visit("my-path", "two"),
    ]);
    expect(await ds.list("my-path")).toEqual(["two", "one"]);
  });
});