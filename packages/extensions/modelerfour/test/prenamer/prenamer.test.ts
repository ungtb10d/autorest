import { ChoiceSchema, CodeModel, ObjectSchema, Operation, Property, StringSchema } from "@autorest/codemodel";
import { ModelerFourOptions } from "modeler/modelerfour-options";
import { PreNamer } from "../../src/prenamer/prenamer";
import { createTestSessionFromModel } from "../utils";

const runPrenamer = async (model: CodeModel, options: ModelerFourOptions = {}) => {
  const { session } = await createTestSessionFromModel<CodeModel>({ modelerfour: options }, model);
  const prenamer = new PreNamer(session);
  await prenamer.init();
  return prenamer.process();
};

describe("Prenamer", () => {
  let model: CodeModel;
  const stringSchema = new StringSchema("", "");

  beforeEach(() => {
    model = new CodeModel("TestPrenamer");
  });

  describe("deduplicating consequitive words", () => {
    describe("in objects", () => {
      it("Remove duplicate consecutive words by default", async () => {
        model.schemas.add(new ObjectSchema("FooBarBar", "Description"));
        const result = await runPrenamer(model);
        expect(result.schemas.objects?.[0].language.default.name).toEqual("FooBar");
      });

      it("Keeps duplicate consecutive words if the new name already exists", async () => {
        model.schemas.add(new ObjectSchema("FooBar", "Description"));
        model.schemas.add(new ObjectSchema("FooBarBar", "Description"));
        const result = await runPrenamer(model);
        expect(result.schemas.objects?.[0].language.default.name).toEqual("FooBar");
        expect(result.schemas.objects?.[1].language.default.name).toEqual("FooBarBar");
      });

      it("Keeps duplicate consecutive words if the new name already exists and still style the word", async () => {
        model.schemas.add(new ObjectSchema("FooBar", "Description"));
        model.schemas.add(new ObjectSchema("fooBar-Bar", "Description"));
        const result = await runPrenamer(model);
        expect(result.schemas.objects?.[0].language.default.name).toEqual("FooBar");
        expect(result.schemas.objects?.[1].language.default.name).toEqual("FooBarBar");
      });

      it("keeps duplicate name if can't find better", async () => {
        model.schemas.add(new ObjectSchema("FooBar", "Description"));
        model.schemas.add(new ObjectSchema("FooBarBar", "Description"));
        model.schemas.add(new ObjectSchema("fooBar-Bar", "Description"));

        const result = await runPrenamer(model);
        expect(result.schemas.objects?.[0].language.default.name).toEqual("FooBar");
        expect(result.schemas.objects?.[1].language.default.name).toEqual("FooBarBar");
        expect(result.schemas.objects?.[2].language.default.name).toEqual("FooBarBar");
      });

      it("deduplicate if there is no options and lenient-model-deduplication is enabled", async () => {
        model.schemas.add(new ObjectSchema("FooBar", "Description"));
        model.schemas.add(new ObjectSchema("FooBarBar", "Description"));
        model.schemas.add(new ObjectSchema("fooBar-Bar", "Description"));

        const result = await runPrenamer(model, {
          "lenient-model-deduplication": true,
        });
        expect(result.schemas.objects?.[0].language.default.name).toEqual("FooBar");
        expect(result.schemas.objects?.[1].language.default.name).toEqual("FooBarBar");
        expect(result.schemas.objects?.[2].language.default.name).toEqual("FooBarBarAutoGenerated");
      });
    });

    describe("in objects properties", () => {
      it("Remove duplicate consecutive words by default", async () => {
        const schema = new ObjectSchema("MyObject", "Description");
        schema.addProperty(new Property("fooBarBar", "desc", stringSchema));
        model.schemas.add(schema);
        const result = await runPrenamer(model);
        const obj = result.schemas.objects?.[0];
        expect(obj?.properties?.[0].language.default.name).toEqual("fooBar");
      });

      it("Keeps duplicate consecutive words if the new name already exists", async () => {
        const schema = new ObjectSchema("MyObject", "Description");
        schema.addProperty(new Property("fooBar", "desc", stringSchema));
        schema.addProperty(new Property("fooBarBar", "desc", stringSchema));
        model.schemas.add(schema);
        const result = await runPrenamer(model);
        const obj = result.schemas.objects?.[0];
        expect(obj?.properties?.[0].language.default.name).toEqual("fooBar");
        expect(obj?.properties?.[1].language.default.name).toEqual("fooBarBar");
      });

      it("Keeps duplicate consecutive words if the new name already exists and still style the word", async () => {
        const schema = new ObjectSchema("MyObject", "Description");
        schema.addProperty(new Property("fooBar", "desc", stringSchema));
        schema.addProperty(new Property("fooBar-Bar", "desc", stringSchema));
        model.schemas.add(schema);
        const result = await runPrenamer(model);
        const obj = result.schemas.objects?.[0];
        expect(obj?.properties?.[0].language.default.name).toEqual("fooBar");
        expect(obj?.properties?.[1].language.default.name).toEqual("fooBarBar");
      });

      it("doesn't deduplicate property names if it can't find a better name. This is not supported", async () => {
        const schema = new ObjectSchema("MyObject", "Description");
        schema.addProperty(new Property("fooBar", "desc", stringSchema));
        schema.addProperty(new Property("fooBarBar", "desc", stringSchema));
        schema.addProperty(new Property("fooBar-Bar", "desc", stringSchema));
        model.schemas.add(schema);
        const result = await runPrenamer(model);
        const obj = result.schemas.objects?.[0];
        expect(obj?.properties?.[0].language.default.name).toEqual("fooBar");
        expect(obj?.properties?.[1].language.default.name).toEqual("fooBarBar");
        expect(obj?.properties?.[2].language.default.name).toEqual("fooBarBar");
      });

      it("deduplicate names if coming from flattened property", async () => {
        const schema = new ObjectSchema("MyObject", "Description");
        schema.addProperty(new Property("foo", "desc", stringSchema));
        schema.addProperty(
          new Property("foo", "desc", stringSchema, {
            flattenedNames: ["nested", "foo"],
          }),
        );
        model.schemas.add(schema);
        const result = await runPrenamer(model);
        const obj = result.schemas.objects?.[0];
        expect(obj?.properties?.[0].language.default.name).toEqual("foo");
        expect(obj?.properties?.[1].language.default.name).toEqual("fooNestedFoo");
      });
    });

    describe("in operation names", () => {
      it("Remove duplicate consecutive words by default", async () => {
        model.getOperationGroup("foo").addOperation(
          new Operation("op1", "Desc", {
            language: { default: { name: "FooBarBar" } },
          }),
        );
        const result = await runPrenamer(model);
        expect(result.operationGroups[0].operations[0].language.default.name).toEqual("FooBar");
      });

      it("Keeps duplicate consecutive words if the another operation with same id already exists in same group", async () => {
        model.getOperationGroup("foo").addOperation(
          new Operation("op1", "Desc", {
            language: { default: { name: "FooBar" } },
          }),
        );
        model.getOperationGroup("foo").addOperation(
          new Operation("op1", "Desc", {
            language: { default: { name: "FooBarBar" } },
          }),
        );
        const result = await runPrenamer(model);
        expect(result.operationGroups[0].operations[0].language.default.name).toEqual("FooBar");
        expect(result.operationGroups[0].operations[1].language.default.name).toEqual("FooBarBar");
      });

      it("Remove duplicate consecutive words if another operation has the same id but in a different group", async () => {
        model.getOperationGroup("group1").addOperation(
          new Operation("op1", "Desc", {
            language: { default: { name: "FooBar" } },
          }),
        );
        model.getOperationGroup("group2").addOperation(
          new Operation("op1", "Desc", {
            language: { default: { name: "FooBarBar" } },
          }),
        );
        const result = await runPrenamer(model);
        expect(result.operationGroups[0].operations[0].language.default.name).toEqual("FooBar");
        expect(result.operationGroups[1].operations[0].language.default.name).toEqual("FooBar");
      });
    });
  });

  it("deduplicate enum and object with the same names", async () => {
    model.schemas.add(new ChoiceSchema("FooBar", "Description"));
    model.schemas.add(new ObjectSchema("FooBar", "Description"));

    const result = await runPrenamer(model, {
      "lenient-model-deduplication": true,
    });
    expect(result.schemas.objects?.[0].language.default.name).toEqual("FooBarAutoGenerated");
    expect(result.schemas.choices?.[0].language.default.name).toEqual("FooBar");
  });
});
