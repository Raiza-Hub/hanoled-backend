import {
  IColumn,
  IMember,
  IParent,
  IParentToStudent,
  ISpreadSheetColumnData,
  ISpreadsheetDetails,
  ISubjectSpreadsheet,
} from "@/admin/dto/dto.js";
import { db } from "@/db/db.js";
import {
  classLevel,
  // subjectSpreadsheet,
  member,
  parent,
  parentToStudents,
  spreadsheetColumn,
  spreadsheetDetails,
  // results,
  student,
  // SubjectSpreadsheet,
} from "@/db/schema.js";
import { and, desc, eq, inArray, or, sql, SQL } from "drizzle-orm";

class MemberService {
  static async getAllMembers(userId: string) {
    return await db.query.member.findMany({
      where: eq(member.userId, userId),
      with: {
        user: true,
      },
    });
  }

  static async getSpecificMember(userId: string, organizationId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      ),
    });
  }

  static async getMemberRecord(userId: string, organizationId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.userId, userId),
        eq(member.organizationId, organizationId)
      ),
      columns: { role: true },
    });
  }

  static async createMember(data: IMember | IParent) {
    if ("isAssigned" in data) {
      return await db.insert(member).values(data).returning();
    } else {
      return await db.insert(parent).values(data).returning();
    }
  }

  static async createParentToStudent(data: IParentToStudent) {
    return await db.insert(parentToStudents).values(data);
  }
  static async getAssignedClass(memberId: string) {
    return await db.query.classLevel.findMany({
      where: eq(classLevel.memberId, memberId),
      with: {
        students: {
          columns: {
            firstName: true,
            middleName: true,
            lastName: true,
            admissionDate: true,
          },
        },
      },
    });
  }
  static async getStudentById(studentId: string) {
    return await db.query.student.findFirst({
      where: eq(student.id, studentId),
    });
  }
  static async checkMember(memberId: string, organizationId: string) {
    return await db.query.member.findFirst({
      where: and(
        eq(member.id, memberId),
        eq(member.organizationId, organizationId)
      ),
    });
  }
  static async createSpreadsheetDetails(
    context: ISpreadsheetDetails,
    columns: IColumn[]
  ) {
    if (columns.length === 0) return [];

    // Extract the names and indexes into two separate arrays
    const namesArray = columns.map((col) => col.name);
    const indexesArray = columns.map((col) => col.index);

    return await db
      .insert(spreadsheetDetails)
      .values({
        organizationId: context.organizationId,
        subjectId: context.subjectId,
        classId: context.classId,
        memberId: context.memberId,
        title: context.title,
        // Pass the arrays directly
        columnNames: namesArray,
        columnIndexes: indexesArray,
      })
      .returning();
  }
  static async createSpreadSheetData(valuesToInsert: ISpreadSheetColumnData[]) {
    return await db
      .insert(spreadsheetColumn)
      .values(valuesToInsert)
      .returning();
  }
  static async getSpreadsheetById(spreadsheetId: string) {
    return await db.query.spreadsheetDetails.findFirst({
      where: eq(spreadsheetDetails.id, spreadsheetId),
    });
  }
  static async getSpreadsheetForHandsontable(
    memberId: string,
    subjectId: string,
    classId: string,
    status: "active" | "pending" | "inactive",
    title: string
  ) {
    // 1. Fetch both the header details and the actual data
    const details = await db.query.spreadsheetDetails.findFirst({
      where: and(
        eq(spreadsheetDetails.memberId, memberId),
        eq(spreadsheetDetails.subjectId, subjectId),
        eq(spreadsheetDetails.classId, classId),
        eq(spreadsheetDetails.status, status),
        eq(spreadsheetDetails.title, title)
      ),
    });
    if (!details) {
      throw new Error("Spreadsheet details not found");
    }

    const columnDataEntries = await db.query.spreadsheetColumn.findMany({
      where: eq(spreadsheetColumn.spreadsheetDetailsId, details.id),
    });

    if (!columnDataEntries.length) {
      throw new Error("Spreadsheet values not found");
    }

    // 2. Identify how many rows we have (based on the first column's data length)
    const rowCount = (columnDataEntries[0].values as any).data.length;
    const reconstructedRows: Record<string, any>[] = [];

    // 3. Reconstruct Row by Row
    for (let i = 0; i < rowCount; i++) {
      const row: Record<string, any> = {};

      // For each row, loop through the column definitions
      details.columnNames.forEach((name, colIndex) => {
        // Find the data entry that matches this index
        const columnEntry = columnDataEntries.find(
          (entry) => (entry.values as any).index === colIndex
        );

        // Assign the value at the current row index (i) to the column name
        row[name] = columnEntry ? (columnEntry.values as any).data[i] : null;
      });

      reconstructedRows.push(row);
    }

    return {
      columns: details.columnNames.map((name) => ({ data: name, title: name })),
      rows: reconstructedRows,
    };
  }
  static async updateFullSpreadsheet(
    memberId: string,
    subjectId: string,
    classId: string,
    title: string | undefined,
    rows: any[]
  ) {
    return await db.transaction(async (tx) => {
      // 1. Update the Manifest (spreadsheetDetails)
      // This tells the system: "Expect these specific columns now."
      const columns: IColumn[] =
        rows.length > 0
          ? Object.keys(rows[0]).map((name, index) => ({
              name,
              index,
            }))
          : [];
      const updateData: {
        columnNames: string[];
        columnIndexes: number[];
        updatedAt: Date;
        title?: string;
      } = {
        columnNames: columns.map((c) => c.name),
        columnIndexes: columns.map((c) => c.index),
        updatedAt: new Date(),
      };
      if (title !== undefined) {
        updateData.title = title;
      }
      const details = await tx
        .update(spreadsheetDetails)
        .set(updateData)
        .where(
          and(
            eq(spreadsheetDetails.memberId, memberId),
            eq(spreadsheetDetails.subjectId, subjectId),
            eq(spreadsheetDetails.classId, classId)
          )
        )
        .returning();

      // 2. Prepare the Data pivot
      const columnData: Record<number, any[]> = {};
      columns.forEach((col) => (columnData[col.index] = []));
      rows.forEach((row) => {
        columns.forEach((col) => {
          columnData[col.index].push(row[col.name] ?? null);
        });
      });

      // 3. Sync the Storage (spreadsheetColumn)
      if (!details[0]) {
        throw new Error("Spreadsheet details not found");
      }
      const detailsId = details[0].id;
      const dataChunks = columns.map((col) => ({
        spreadsheetDetailsId: detailsId,
        values: {
          index: col.index,
          data: columnData[col.index],
          count: columnData[col.index].length,
        },
      }));

      // Delete existing columns for this spreadsheet before inserting new ones
      await tx
        .delete(spreadsheetColumn)
        .where(eq(spreadsheetColumn.spreadsheetDetailsId, detailsId));

      // Insert the new/updated columns
      return await tx.insert(spreadsheetColumn).values(dataChunks).returning();
    });
  }
  static async combineColumnsToNewSheet(
    context: ISpreadsheetDetails, // orgId, memberId, classId, etc.
    newTitle: string,
    selections: { detailsId: string; colIndex: number; newName: string }[]
  ) {
    return await db.transaction(async (tx) => {
      // 1. Create the NEW Spreadsheet Header
      const [newSheet] = await tx
        .insert(spreadsheetDetails)
        .values({
          organizationId: context.organizationId,
          subjectId: context.subjectId,
          classId: context.classId,
          memberId: context.memberId,
          title: newTitle,
          columnNames: selections.map((s) => s.newName),
          columnIndexes: selections.map((_, i) => i), // New indexes 0, 1, 2...
        })
        .returning();

      // 2. Fetch all selected columns in one query
      const sourceData = await tx.query.spreadsheetColumn.findMany({
        where: or(
          ...selections.map((s) =>
            and(
              eq(spreadsheetColumn.spreadsheetDetailsId, s.detailsId),
              sql`(values->>'index')::int = ${s.colIndex}`
            )
          )
        ),
      });

      // 3. Map the old data to the NEW spreadsheet structure
      const newColumnRows = selections.map((sel, newIdx) => {
        // Find the specific data array from our fetched results
        const matchingCol = sourceData.find(
          (d) =>
            d.spreadsheetDetailsId === sel.detailsId &&
            (d.values as any).index === sel.colIndex
        );

        return {
          spreadsheetDetailsId: newSheet.id,
          values: {
            index: newIdx, // Re-indexed for the new sheet
            data: matchingCol ? (matchingCol.values as any).data : [],
          },
        };
      });

      // 4. Save the combined columns
      await tx.insert(spreadsheetColumn).values(newColumnRows);

      return newSheet;
    });
  }
  static async getRawSpreadSheetDetails(
    memberId: string,
    subjectId: string,
    classId: string,
    status: "active" | "pending" | "inactive",
    title: string
  ) {
    return await db.query.spreadsheetDetails.findFirst({
      where: and(
        eq(spreadsheetDetails.memberId, memberId),
        eq(spreadsheetDetails.subjectId, subjectId),
        eq(spreadsheetDetails.classId, classId),
        eq(spreadsheetDetails.status, status),
        eq(spreadsheetDetails.title, title)
      ),
    });
  }
  static async mergeColumnsIntoSpreadsheet(
    targetDetailsId: string,
    merges: {
      sourceDetailsId: string;
      sourceColIndex: number;
      asName: string;
    }[]
  ) {
    return await db.transaction(async (tx) => {
      // 1. Fetch current target metadata
      const target = await tx.query.spreadsheetDetails.findFirst({
        where: eq(spreadsheetDetails.id, targetDetailsId),
      });
      if (!target) throw new Error("Target spreadsheet not found");

      // 2. Fetch the source column data
      // We fetch all source arrays in one go using an 'OR' filter
      const sourceData = await tx.query.spreadsheetColumn.findMany({
        where: or(
          ...merges.map((m) =>
            and(
              eq(spreadsheetColumn.spreadsheetDetailsId, m.sourceDetailsId),
              sql`(values->>'index')::int = ${m.sourceColIndex}`
            )
          )
        ),
      });

      // 3. Prepare the New Metadata
      const updatedNames = [...target.columnNames];
      const updatedIndexes = [...target.columnIndexes];
      let nextIndex = Math.max(...updatedIndexes) + 1;

      const dataChunks: {
        spreadsheetDetailsId: string;
        values: {
          index: number;
          data: any;
          count: any;
        };
      }[] = [];

      for (const merge of merges) {
        const match = sourceData.find(
          (d) =>
            d.spreadsheetDetailsId === merge.sourceDetailsId &&
            (d.values as any).index === merge.sourceColIndex
        );

        if (match) {
          // Add to Metadata arrays
          updatedNames.push(merge.asName);
          updatedIndexes.push(nextIndex);

          // Prepare for DB insertion
          dataChunks.push({
            spreadsheetDetailsId: targetDetailsId,
            values: {
              index: nextIndex,
              data: (match.values as any).data,
              count: (match.values as any).count,
            },
          });

          nextIndex++;
        }
      }

      // 4. Update the Target Manifest (Details)
      await tx
        .update(spreadsheetDetails)
        .set({
          columnNames: updatedNames,
          columnIndexes: updatedIndexes,
          updatedAt: new Date(),
        })
        .where(eq(spreadsheetDetails.id, targetDetailsId));

      // 5. Insert the new Column Data
      await tx.insert(spreadsheetColumn).values(dataChunks);

      return {
        addedColumns: updatedNames.slice(target.columnNames.length),
      };
    });
  }
  static async getMemberSpreadsheets(
    memberId: string,
    status: "active" | "pending" | "inactive"
  ) {
    return await db
      .select({
        id: spreadsheetDetails.id,
        title: spreadsheetDetails.title,
        subjectId: spreadsheetDetails.subjectId,
        classId: spreadsheetDetails.classId,
        columnNames: spreadsheetDetails.columnNames,
        status: spreadsheetDetails.status,
        createdAt: spreadsheetDetails.createdAt,
        updatedAt: spreadsheetDetails.updatedAt,
      })
      .from(spreadsheetDetails)
      .where(
        and(
          eq(spreadsheetDetails.memberId, memberId),
          eq(spreadsheetDetails.status, status)
        )
      )
      .orderBy(desc(spreadsheetDetails.updatedAt));
  }
  static async updateSpreadsheetStatus(
    memberId: string,
    subjectId: string,
    classId: string,
    updateData: { status: "active" | "pending" | "inactive" },
    oldStatus: "active" | "pending" | "inactive",
    title: string
  ) {
    return await db
      .update(spreadsheetDetails)
      .set(updateData)
      .where(
        and(
          eq(spreadsheetDetails.memberId, memberId),
          eq(spreadsheetDetails.classId, classId),
          eq(spreadsheetDetails.subjectId, subjectId),
          eq(spreadsheetDetails.status, oldStatus),
          eq(spreadsheetDetails.title, title)
        )
      );
  }
}

export default MemberService;
