// Program requirements, 2026-27 Tyndale program sheets.
// Row forms: "CODE" required | {pick:n, of:[...]} choose n | {pool:[...], label, cr:N} choose any combination toward the credit total
//            {el:"label", cr:N} elective slots you fill | {free:N} free electives, filled automatically
const PDF = "https://www.tyndale.ca/sites/default/files/programs/";
const ENG2 = {pick:2, of:["ENGL 101","ENGL 102","ENGL 171"]};
// Every sheet's "core Humanities" block is actually: one of HIST 101/102, PLUS INDS 101, INDS 475
// and PHIL 171 each required separately (not one five-way choice). Spread this with ...HUM1.
const HUM1 = [{pick:1, of:["HIST 101","HIST 102"]}, "INDS 101", "INDS 475", "PHIL 171"];
const BSTH4 = ["BSTH 101","BSTH 102","BSTH 201","BSTH 270"];
const FA = {el:"Fine Arts elective", cr:3, hint:"ARTM, MUSC or MEDA"};
const NS = {el:"Natural Sciences elective", cr:3, hint:"BIOL, CHEM, PHYS, GEOG, ENVS"};
const SS = {el:"Social Sciences elective", cr:3, hint:"PSYC, SOCI, ECON"};
const UL = "At least 45 of 120 credit hours must be at the 3000 or 4000 level.";

const coreStd = (cr, extra=[]) => ["Core requirements", cr, [...BSTH4, ENG2, ...HUM1, ...extra]];

const BST_MAJOR = (extraBST, fourK, lang) => [
  ...BSTH4,
  {pick:1, of:["BSTH 280","BSTH 382","BSTH 383","BSTH 387"]},
  {el:"Old Testament course (BSTH 310–329)", cr:3},
  {el:"New Testament course (BSTH 330–349)", cr:3},
  {el:"Christian Theology courses (BSTH 360–379)", cr:6},
  {el:"Biblical Studies and Theology courses", cr:extraBST},
  {el:"BSTH 4000-level (not BSTH 450)", cr:fourK},
  "HIST 251","HIST 252", lang
];
const GH6 = {pool:["GREE 201","GREE 202","HEBR 201","HEBR 202"], label:"Greek or Hebrew, two courses in one language", cr:6, oneTrack:true};
const GH12 = {pool:["GREE 201","GREE 202","GREE 301","GREE 302","GREE 451","HEBR 201","HEBR 202","HEBR 301","HEBR 302"], label:"Greek and/or Hebrew", cr:12};

const PSYC_CORE = ["MATH 121","MATH 322","PSYC 101","PSYC 102","PSYC 211","PSYC 301","PSYC 305","PSYC 310","PSYC 321","PSYC 332","PSYC 341","PSYC 360"];
const BBA_REQ = ["BUSI 101","BUSI 201","BUSI 203","BUSI 215","BUSI 231","BUSI 261","BUSI 262","BUSI 301","BUSI 314","BUSI 321","BUSI 325","BUSI 372","BUSI 381","BUSI 411","BUSI 420"];
const BBA_CORE = ["Core requirements", 33, [...BSTH4,"INDS 101","PHIL 171","INDS 475",{pick:1,of:["HIST 101","HIST 102"]},ENG2,FA]];
const ENGL_PERIOD = ["ENGL 301","ENGL 303","ENGL 305","ENGL 310","ENGL 320","ENGL 331","ENGL 332","ENGL 333","ENGL 340","ENGL 372"];
const ENGL_AMER = ["ENGL 383","ENGL 384","ENGL 387","ENGL 388","ENGL 403"];
// The BA's "Two of" group is ENGL 101/102/171 only; INDS 101, INDS 475 and PHIL 171 are each required separately.
const HGS_CORE = ["Core requirements", 36, [...BSTH4, ENG2, "INDS 101", "INDS 475", "PHIL 171", FA, NS, SS]];
const HGS_CHR = {pick:1, of:["HIST 251","HIST 252","HIST 312","HIST 313"]};
// BA option lists (Honours moves HIST 481 and HIST 441 out of these lists and into required rows instead).
const HGS_AMER = {pick:1, of:["HIST 263","HIST 271","HIST 272","HIST 281","HIST 282","HIST 372","HIST 375","HIST 376","HIST 382","HIST 384","HIST 387","HIST 481"]};
const HGS_EUR = {pick:1, of:["HIST 240","HIST 241","HIST 242","HIST 291","HIST 292","HIST 321","HIST 331","HIST 342","HIST 343","HIST 344","HIST 345","HIST 346","HIST 363","HIST 441"]};
const HGS_AMER_H = {pick:1, of:["HIST 263","HIST 271","HIST 272","HIST 281","HIST 282","HIST 372","HIST 375","HIST 376","HIST 382","HIST 384","HIST 387"]};
const HGS_EUR_H = {pick:1, of:["HIST 240","HIST 241","HIST 242","HIST 291","HIST 292","HIST 321","HIST 331","HIST 342","HIST 343","HIST 344","HIST 345","HIST 346","HIST 363"]};
const PHIL_CORE = ["Core requirements", 36, [...BSTH4,ENG2,{pick:1,of:["HIST 101","HIST 102"]},"INDS 101","INDS 475",FA,NS,SS]];
// PHIL 363 / PHIL 366 / PHIL 421 are a single three-way "One of" group, not a pick-1 plus a separate required course.
const PHIL_MAJ = ["PHIL 171","PHIL 201",{el:"PHIL 2000-level course",cr:3},"PHIL 301","PHIL 302","PHIL 370",{pick:1,of:["PHIL 311","PHIL 330"]},{pick:1,of:["PHIL 321","PHIL 322"]},{pick:1,of:["PHIL 363","PHIL 366","PHIL 421"]}];
const LING_CORE = ["Core requirements", 36, [...BSTH4,ENG2,...HUM1,FA,NS]];
const LING_REQ = ["LING 101","LING 102","LING 201","LING 203","LING 204","LING 211"];
// Every Media Arts sheet (majors and the minor) opens with these same two clusters:
// one of MEDA 111/113, plus MEDA 121 and MEDA 210 required (9 credit hours); then
// one of MEDA 230/PHIL 241, plus MEDA 212 required (6 credit hours).
const MEDA_PROD1 = [{pick:1, of:["MEDA 111","MEDA 113"]}, "MEDA 121", "MEDA 210"];
const MEDA_PHIL = [{pick:1, of:["MEDA 230","PHIL 241"]}, "MEDA 212"];
const MA_CORE = ["Core requirements", 33, [...BSTH4,ENG2,...HUM1,NS]];
// Each Media Arts variant's "Major Elective Requirements" list is its own — it excludes whatever
// is already a major requirement for that variant. Lists below are per-variant, from the sheets.
const MEDA_ELECT_BUS = ["ARTM 310","MEDA 322","MEDA 214","MEDA 220","MEDA 312","MEDA 320","MEDA 340","MEDA 310","MEDA 324","MEDA 3XX-DOC","MEDA 3XX-HMJ","MEDA 3XX-MEF","MEDA 4XX-ETH","MEDA 4XX-FCW","MEDA 410","MEDA 4XX-EXP","MEDA 4XX-MCT"];
const MEDA_ELECT_FA = ["BUSI 231","MEDA 280","MEDA 214","MEDA 220","MEDA 312","MEDA 340","MEDA 310","MEDA 324","MEDA 3XX-SMB","MEDA 3XX-HMJ","MEDA 3XX-MEF","MEDA 4XX-ETH","MEDA 4XX-FCW","MEDA 410","MEDA 4XX-MCT","MEDA 4XX-APM","MEDA 3XX-RSS","PSYC 360"];
const MEDA_ELECT_MIN = ["ARTM 310","MEDA 322","BUSI 231","MEDA 280","MEDA 214","MEDA 220","MEDA 312","MEDA 320","MEDA 380","MEDA 310","MEDA 324","MEDA 3XX-SMB","MEDA 3XX-DOC","MEDA 4XX-ETH","MEDA 410","MEDA 4XX-EXP","MEDA 4XX-APM","MEDA 3XX-RSS","PSYC 360"];
const MEDA_ELECT_PROD = ["ARTM 340","MEDA 340","BUSI 231","MEDA 280","MEDA 220","MEDA 320","MEDA 3XX-SMB","MEDA 3XX-HMJ","MEDA 310","MEDA 324","MEDA 4XX-ETH","MEDA 4XX-FCW","MEDA 4XX-EXP","MEDA 4XX-MCT","MEDA 4XX-APM","MEDA 3XX-RSS","PSYC 360"];
// Honours adds a 6-credit Internship and a 6-credit "Senior Thesis, or ARTM 312 + ARTM 350" either/or.
const MA_HONS = ["Honours requirements", 12, ["MEDA 4XX-INT", {pool:["MEDA 4XX-THS","ARTM 312","ARTM 350"], label:"Senior Thesis (MEDA 4XX-THS) or ARTM 312 + ARTM 350", cr:6}]];
const MUS_CORE = ["Core requirements", 36, [...BSTH4,ENG2,...HUM1,NS,SS]];
// General Ministries, Pastoral Ministry and Youth Ministry (BRE) all share this exact 63-credit core.
const BRE_CORE = ["Core requirements", 63, [...BSTH4, {el:"BSTH 3000-level courses",cr:6}, {el:"Biblical Studies and Theology courses",cr:6}, "CHRI 203", {pick:1,of:["CHRI 221","CHRI 321"]}, {pick:1,of:["CHRI 341","CHRI 361"]}, ENG2, "HIST 251","HIST 252","INDS 101","PHIL 171", FA, NS, {el:"Social Sciences electives",cr:6}]];
const BRE_CORE_TOP = [...BSTH4];
const CHRI_INTERN = {pick:1, of:["CHRI 329","CHRI 339","CHRI 349","CHRI 369"]};
const SCI_CORE = ["Core Tyndale courses", 15, [{pick:1,of:["BSTH 101","BSTH 102"]},{pick:1,of:["ENGL 101","ENGL 102"]},{pick:1,of:["HIST 101","HIST 102"]},"INDS 101","PHIL 171"]];
const HS_INTER = ["Interdisciplinary studies", 30, ["HEAL 301","MATH 121","MATH 322","PSYC 101","PSYC 102","PSYC 211","PSYC 212","PSYC 360","SOCI 101","SOCI 102"]];

const PROGRAMS = [
// ---------- Biblical Studies & Theology
{id:"bst", group:"Bachelor of Arts", name:"Biblical Studies and Theology", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-2026-2027.pdf",
 blocks:[["Core requirements",27,[ENG2,...HUM1,FA,NS,SS]],["Major requirements",48,BST_MAJOR(6,3,GH6)],["Electives",45,[{free:45}]]], notes:[UL,"GREE 301/302 or HEBR 301/302 may replace 3000-level BSTH electives."]},
{id:"bst-h", group:"Bachelor of Arts Honours", name:"Biblical Studies and Theology", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-2026-2027.pdf",
 blocks:[["Core requirements",27,[ENG2,...HUM1,FA,NS,SS]],["Major requirements",66,[...BST_MAJOR(9,6,GH12),"BSTH 497","BSTH 499"]],["Electives",27,[{free:27}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
{id:"bst-mdiv", group:"Dual degree", name:"Biblical Studies and Theology + MDiv", cred:"BA / MDiv", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-2026-2027.pdf",
 blocks:[["Core requirements",27,[ENG2,...HUM1,FA,NS,SS]],["Major requirements",48,BST_MAJOR(6,3,GH6)],["Minor (any except Christian Ministries)",24,[{el:"Minor courses (pick your minor below)",cr:24}]],["Electives",6,[{free:6}]],["Advanced standing",15,[{el:"Seminary (MDiv) courses transferred",cr:15}]]], notes:[UL,"Five MDiv courses transfer back as electives; both degrees conferred at completion."]},
{id:"bst-pent", group:"Bachelor of Arts", name:"Biblical Studies and Theology – Pentecostal", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-PAONL-2026-2027.pdf",
 blocks:[["Core requirements",24,[ENG2,...HUM1,FA,NS]],["Major requirements",36,[...BSTH4,{pick:1,of:["BSTH 280","BSTH 382","BSTH 383","BSTH 387"]},{el:"Old Testament course (BSTH 310–329)",cr:3},{el:"New Testament course (BSTH 330–349)",cr:3},{el:"BSTH 4000-level course (not BSTH 450)",cr:3},"HIST 251","HIST 252",GH6]],
  ["Pentecostal program",45,["CHRI 121","BSTH 267","BSTH 386","CHRI 343","CHRI 344","CHRI 308",{pick:5,of:["BSTH 332","BSTH 335","BSTH 374","BSTH 376","BSTH 377","BSTH 378","BSTH 379"]},{pick:2,of:["BUSI 383","BUSI 317","CHRI 243","PSYC 211","PSYC 212"]}]],["Electives",15,[{free:15}]]],
 notes:[UL,"CHRI 308 (Internship in Pentecostal Ministry) is 9 credit hours."]},
// ---------- Business
{id:"bus", group:"Bachelor of Arts", name:"Business", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Business-2026-2027.pdf",
 blocks:[coreStd(33,[FA]),["Major requirements",42,["BUSI 101","BUSI 215","BUSI 231","BUSI 411",{el:"BUSI courses",cr:12},"ECON 101","ECON 102","MATH 121",{pick:3,of:["HIST 384","MATH 323","PHIL 201","PSYC 345"]}]],["Electives",45,[{free:45}]]], notes:[UL,"The Business sheet calls this course MATH 323 (Data Analysis); the Psychology sheet calls the same course MATH 322. Tyndale's own sheets disagree — worth confirming with the Registrar."]},
{id:"bba", group:"Bachelor of Business Administration", name:"Business Administration", cred:"BBA", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Business-Administration-2026-2027.pdf",
 blocks:[BBA_CORE,["Major requirements",66,[...BBA_REQ,{el:"Business Administration courses",cr:12},"ECON 101","ECON 102","MATH 121"]],["Electives",21,[{free:21}]]], notes:[UL,"6 elective credit hours must be at the 3000/4000 level.","BUSI 102 recommended without Grade 12 math."]},
{id:"bba-h", group:"Bachelor of Business Administration", name:"Business Administration Honours", cred:"BBA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Business-Administration-2026-2027.pdf",
 blocks:[BBA_CORE,["Major requirements",75,[...BBA_REQ,{el:"BUSI 3000-level courses",cr:15},{el:"BUSI 4000-level courses",cr:6},"ECON 101","ECON 102","MATH 121"]],["Electives",12,[{free:12}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
// ---------- Christian Ministry
{id:"cmpt", group:"Bachelor of Arts", name:"Christian Ministry and Practical Theology", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-BA-Christian-Ministry-and-Practical-Theology-2026-2027.pdf",
 blocks:[coreStd(39,[FA,NS,SS]),["Major requirements",48,[{el:"BSTH 310–349 (Bible)",cr:3},{el:"BSTH 360–379 (Theology)",cr:3},{el:"BSTH 310–379",cr:3},"CHRI 121","CHRI 203",CHRI_INTERN,"CHRI 343","CHRI 344","CHRI 347",GH6,{el:"BSTH/CHRI courses, PHIL 294, PSYC 211 or 212",cr:15}]],["Electives",33,[{free:33}]]], notes:[UL]},
// ---------- English
{id:"engl", group:"Bachelor of Arts", name:"English", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-English-2026-2027.pdf", conc:["engl-wc"],
 blocks:[["Core requirements",33,[...BSTH4,...HUM1,FA,NS,SS]],["Major requirements",36,["ENGL 101","ENGL 102",{el:"ENGL course",cr:3},{pick:1,of:["ENGL 262","ENGL 263"]},"ENGL 375","ENGL 378",{el:"ENGL 3000-level courses",cr:9},{el:"ENGL 4000-level course",cr:3},{pick:1,of:ENGL_AMER},{pick:1,of:ENGL_PERIOD}]],["Electives",51,[{free:51}]]], notes:[UL]},
{id:"engl-h", group:"Bachelor of Arts Honours", name:"English", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-English-2026-2027.pdf", conc:["engl-wc"],
 blocks:[["Core requirements",33,[...BSTH4,...HUM1,FA,NS,SS]],["Major requirements",45,["ENGL 101","ENGL 102",{el:"ENGL course",cr:3},{pick:1,of:["ENGL 262","ENGL 263"]},"ENGL 375","ENGL 378",{el:"ENGL 3000-level course",cr:3},{el:"ENGL 4000-level course",cr:3},"ENGL 400",{pick:1,of:ENGL_AMER},{pick:3,of:ENGL_PERIOD},{pool:["ENGL 497","ENGL 499"],label:"Honours thesis (ENGL 497 + 499) or two ENGL 4000-level courses",cr:6}]],["Electives",42,[{free:42}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
// ---------- History
{id:"hgs", group:"Bachelor of Arts", name:"History and Global Studies", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-History-and-Global-Studies-2026-2027.pdf",
 blocks:[HGS_CORE,["Major requirements",36,["HIST 101","HIST 102","HIST 301",{el:"HIST 2000-level course",cr:3},{el:"HIST 3000-level courses",cr:12},{el:"HIST 4000-level course",cr:3},HGS_CHR,HGS_AMER,HGS_EUR]],["Electives",48,[{free:48}]]], notes:[UL]},
{id:"hgs-h", group:"Bachelor of Arts Honours", name:"History and Global Studies", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-History-and-Global-Studies-2026-2027.pdf",
 blocks:[HGS_CORE,["Major requirements",48,["HIST 101","HIST 102","HIST 301","HIST 441","HIST 481",{el:"HIST 3000-level courses",cr:18},HGS_CHR,HGS_AMER_H,HGS_EUR_H,"HIST 497","HIST 499"]],["Electives",36,[{free:36}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
// ---------- Human Services
{id:"ece", group:"Bachelor of Arts", name:"Human Services – Early Childhood Education", cred:"BA + Diploma", total:120, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Early-Childhood-Education-2026-2027.pdf",
 blocks:[coreStd(33,[FA]),HS_INTER,["Major requirements",39,[{el:"PSYC 3000-level course",cr:3},{el:"PSYC 4000-level course",cr:3},"SOCI 321",{el:"Seneca Polytechnic ECE diploma (year 3)",cr:30}]],["Electives",18,[{free:18}]]], notes:["One-year Early Childhood Education diploma at Seneca Polytechnic in third year (30 transfer credits)."]},
{id:"ssw", group:"Bachelor of Arts", name:"Human Services – Social Service Work", cred:"BA + Diploma", total:120, gpa:"2.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Social-Service-Work-2026-2027.pdf",
 blocks:[coreStd(33,[FA]),HS_INTER,["Major requirements",39,["SOCI 251","SOCI 252","SOCI 321",{el:"Seneca Polytechnic Social Service Worker diploma (year 3)",cr:30}]],["Electives",18,[{free:18}]]], notes:["One-year diploma at Seneca Polytechnic in third year (30 transfer credits)."]},
// ---------- Linguistics
{id:"ling", group:"Bachelor of Arts", name:"Linguistics", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Linguistics-2026-2027.pdf", conc:["ling-bt"],
 blocks:[LING_CORE,["Major requirements",36,[...LING_REQ,{el:"LING 3000-level courses",cr:12},{el:"LING 4000-level courses",cr:6}]],["Electives",48,[{free:48}]]], notes:[UL]},
{id:"ling-h", group:"Bachelor of Arts Honours", name:"Linguistics", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Linguistics-2026-2027.pdf", conc:["ling-bt"],
 blocks:[LING_CORE,["Major requirements",48,[...LING_REQ,{el:"LING 3000-level courses",cr:18},{el:"LING 4000-level courses",cr:6},"LING 497","LING 499"]],["Electives",36,[{free:36}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
// ---------- Media Arts
{id:"ma-bus", group:"Bachelor of Arts", name:"Media Arts – Business", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Business-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",36,[...MEDA_PROD1,...MEDA_PHIL,{pick:1,of:["BUSI 231","MEDA 280"]},{pick:1,of:["ARTM 340","MEDA 232"]},{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},"MEDA 3XX-SMB","MEDA 380",{pick:1,of:["MEDA 3XX-RSS","PSYC 360"]},"MEDA 4XX-APM"]],["Major electives",9,[{pick:3,of:MEDA_ELECT_BUS}]],["Electives",42,[{free:42}]]], notes:[UL]},
{id:"ma-bus-h", group:"Bachelor of Arts Honours", name:"Media Arts – Business", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Business-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",36,[...MEDA_PROD1,...MEDA_PHIL,{pick:1,of:["BUSI 231","MEDA 280"]},{pick:1,of:["ARTM 340","MEDA 232"]},{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},"MEDA 3XX-SMB","MEDA 380",{pick:1,of:["MEDA 3XX-RSS","PSYC 360"]},"MEDA 4XX-APM"]],MA_HONS,["Major electives",9,[{pick:3,of:MEDA_ELECT_BUS}]],["Electives",30,[{free:30}]]], notes:[UL,"Minimum cumulative GPA 3.0.","This PDF is missing a couple of pages around the Honours totals; numbers follow the same pattern as the other three Honours variants, which are fully confirmed."]},
{id:"ma-fa", group:"Bachelor of Arts", name:"Media Arts – Fine Arts", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Fine-Arts-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",36,[...MEDA_PROD1,...MEDA_PHIL,{pick:1,of:["ARTM 340","MEDA 232"]},"MEDA 320",{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},{pick:1,of:["ARTM 310","MEDA 322"]},"MEDA 380","MEDA 3XX-DOC","MEDA 4XX-EXP"]],["Major electives",9,[{pick:3,of:MEDA_ELECT_FA}]],["Electives",42,[{free:42}]]], notes:[UL,"Tyndale's own sheet mislabels this block's total as \"Total Degree Requirements\" — it means Total Major Requirements (36)."]},
{id:"ma-fa-h", group:"Bachelor of Arts Honours", name:"Media Arts – Fine Arts", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Fine-Arts-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",36,[...MEDA_PROD1,...MEDA_PHIL,{pick:1,of:["ARTM 340","MEDA 232"]},"MEDA 320",{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},{pick:1,of:["ARTM 310","MEDA 322"]},"MEDA 380","MEDA 3XX-DOC","MEDA 4XX-EXP"]],MA_HONS,["Major electives",9,[{pick:3,of:MEDA_ELECT_FA}]],["Electives",30,[{free:30}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
{id:"ma-min", group:"Bachelor of Arts", name:"Media Arts – Media Ministry", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Media-Ministry-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",36,[...MEDA_PROD1,...MEDA_PHIL,{pick:1,of:["ARTM 340","MEDA 232"]},"MEDA 340",{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},"MEDA 3XX-HMJ","MEDA 3XX-MEF","MEDA 4XX-FCW","MEDA 4XX-MCT"]],["Major electives",9,[{pick:3,of:MEDA_ELECT_MIN}]],["Electives",42,[{free:42}]]], notes:[UL]},
{id:"ma-min-h", group:"Bachelor of Arts Honours", name:"Media Arts – Media Ministry", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Media-Ministry-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",36,[...MEDA_PROD1,...MEDA_PHIL,{pick:1,of:["ARTM 340","MEDA 232"]},"MEDA 340",{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},"MEDA 3XX-HMJ","MEDA 3XX-MEF","MEDA 4XX-FCW","MEDA 4XX-MCT"]],MA_HONS,["Major electives",9,[{pick:3,of:MEDA_ELECT_MIN}]],["Electives",30,[{free:30}]]], notes:[UL,"Minimum cumulative GPA 3.0."]},
{id:"ma-prod", group:"Bachelor of Arts", name:"Media Arts – Production", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Production-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",39,[{pick:1,of:["MEDA 111","MEDA 113"]},"MEDA 121","MEDA 210","MEDA 212","MEDA 214",{pick:1,of:["MEDA 230","PHIL 241"]},{pick:1,of:["ARTM 340","MEDA 232"]},"MEDA 312",{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},{pick:1,of:["ARTM 310","MEDA 322"]},"MEDA 380","MEDA 3XX-DOC","MEDA 410"]],["Major electives",6,[{pick:2,of:MEDA_ELECT_PROD}]],["Electives",42,[{free:42}]]], notes:[UL,"Uses the 2026–27 sheet (replaces the 2025–26 sheet this used to cite). The Language elective requirement from 2025–26 is gone."]},
{id:"ma-prod-h", group:"Bachelor of Arts Honours", name:"Media Arts – Production", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Production-2026-2027.pdf",
 blocks:[MA_CORE,["Major requirements",39,[{pick:1,of:["MEDA 111","MEDA 113"]},"MEDA 121","MEDA 210","MEDA 212","MEDA 214",{pick:1,of:["MEDA 230","PHIL 241"]},{pick:1,of:["ARTM 340","MEDA 232"]},"MEDA 312",{pick:1,of:["HIST 387","MEDA 3XX-SWC"]},{pick:1,of:["ARTM 310","MEDA 322"]},"MEDA 380","MEDA 3XX-DOC","MEDA 410"]],MA_HONS,["Major electives",6,[{pick:2,of:MEDA_ELECT_PROD}]],["Electives",30,[{free:30}]]], notes:[UL,"Minimum cumulative GPA 3.0.","Uses the 2026–27 sheet."]},
// ---------- Music
{id:"musc", group:"Bachelor of Arts", name:"Music", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Music-BA-2026-2027.pdf",
 blocks:[MUS_CORE,["Major requirements",48,["MUSC 101","MUSC 201","MUSC 202","MUSC 390",{pick:1,of:["MUSC 490","MUSC 491"]},{el:"Music and Worship Arts elective",cr:3},{el:"Music and Worship Arts courses (3000-level)",cr:9},{el:"Applied Music on your instrument (voice, piano, guitar, bass, drums)",cr:12},{el:"Music Ensemble",cr:12}]],["Electives",36,[{free:36}]]], notes:[UL,"Vocal students: Tyndale Singers (8 cr) plus other ensembles (4 cr). Instrumental: Band or Jazz Combo."]},
{id:"musc-perf", group:"Bachelor of Fine Arts Honours", name:"Music: Performance", cred:"BFA Honours", total:122, gpa:"3.0", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Music-Performance-BFA-2026-2027.pdf",
 blocks:[MUS_CORE,["Major requirements",74,["MUSC 101","MUSC 201","MUSC 202","MUSC 304","MUSC 331","MUSC 332","MUSC 335","MUSC 369","MUSC 390","MUSC 404","MUSC 432","MUSC 490",{el:"Music Technology elective",cr:3},{el:"Instrument literature, pedagogy and Music/Worship Arts elective (varies by instrument — piano: MUSC 141+441+442, no separate MWA; voice/guitar/bass/drums: 5 credits of literature+pedagogy plus a 3-credit MWA elective)",cr:8},{el:"Applied Music on your instrument",cr:16},{el:"Music Ensemble",cr:16}]],["Electives",12,[{free:12}]]], notes:["At least 45 of 122 credit hours must be at the 3000 or 4000 level."]},
{id:"musc-wa", group:"Bachelor of Fine Arts Honours", name:"Music: Worship Arts", cred:"BFA Honours", total:122, gpa:"3.0", pdf:PDF+"2026-10/Tyndale-University-Music-Worship-Arts-BFA-Program-Requirements-2026-2027.pdf",
 blocks:[MUS_CORE,["Major requirements",74,["ARTM 310","CHRI 346","CHRI 347","MUSC 101","MUSC 201","MUSC 202","MUSC 304","MUSC 332","MUSC 335","MUSC 369","MUSC 371","MUSC 390",{el:"Pedagogy (MUSC 4X1)",cr:2},"MUSC 404","MUSC 432","MUSC 491",{el:"Applied Music on your instrument",cr:16},{el:"Music Ensemble",cr:16}]],["Electives",12,[{free:12}]]], notes:["At least 45 of 122 credit hours must be at the 3000 or 4000 level."]},
// ---------- Philosophy
{id:"phil", group:"Bachelor of Arts", name:"Philosophy", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Philosophy-2026-2027.pdf", conc:["phil-apol","phil-law"],
 blocks:[PHIL_CORE,["Major requirements",36,[...PHIL_MAJ,{el:"PHIL 3000-level courses",cr:6},{el:"PHIL 4000-level course",cr:3}]],["Electives",48,[{free:48}]]], notes:[UL]},
{id:"phil-h", group:"Bachelor of Arts Honours", name:"Philosophy", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Philosophy-2026-2027.pdf", conc:["phil-apol","phil-law"],
 blocks:[PHIL_CORE,["Major requirements",48,[...PHIL_MAJ,{el:"PHIL 3000-level courses",cr:9},{el:"PHIL 4000-level courses",cr:6},{pool:["PHIL 497","PHIL 499"],label:"Honours thesis (PHIL 497 + 499) or two PHIL 4000-level courses",cr:6}]],["Electives",36,[{free:36}]]], notes:[UL,"Minimum cumulative GPA 3.0. Apply in the winter of second year."]},
// ---------- Psychology
{id:"psyc", group:"Bachelor of Arts", name:"Psychology", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Psychology-with-DCP-2026-2027.pdf",
 blocks:[coreStd(33,[FA]),["Major requirements",48,[...PSYC_CORE,{el:"PSYC 3000-level courses",cr:6},{el:"PSYC 4000-level courses",cr:6}]],["Electives",39,[{free:39}]]], notes:[UL]},
{id:"psyc-h", group:"Bachelor of Arts Honours", name:"Psychology", cred:"BA Honours", total:120, gpa:"3.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Psychology-with-DCP-2026-2027.pdf",
 blocks:[coreStd(33,[FA]),["Major requirements",54,[...PSYC_CORE,{el:"PSYC 3000-level courses",cr:6},"PSYC 401","PSYC 461","PSYC 497","PSYC 499"]],["Electives",33,[{free:33}]]], notes:[UL,"Finish PSYC 360 and PSYC 461 by the end of third year; arrange a thesis supervisor by February 28 of third year."]},
{id:"psyc-dcp", group:"Degree completion", name:"Psychology Degree Completion", cred:"BA", total:120, gpa:"2.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Psychology-with-DCP-2026-2027.pdf",
 blocks:[coreStd(33,[FA]),["Major requirements",51,[...PSYC_CORE,"PSYC 392",{el:"PSYC 3000-level courses",cr:6},"PSYC 401",{el:"PSYC 4000-level course",cr:3}]],["Electives",36,[{free:36}]]], notes:[UL,"For students 25+ with 30–42 transferable credit hours."]},
// ---------- BRE
{id:"bre-gm", group:"Bachelor of Religious Education", name:"General Ministries", cred:"BRE", total:90, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-General-Ministries-2026-2027.pdf",
 blocks:[BRE_CORE,["General Ministries focus",15,["CHRI 121","CHRI 344",{el:"Christian Ministries courses",cr:6},CHRI_INTERN]],["Electives",12,[{free:12}]]], notes:["At least 24 of 90 credit hours must be at the 3000 or 4000 level."]},
{id:"bre-dcp", group:"Degree completion", name:"BRE Degree Completion", cred:"BRE", total:90, gpa:"2.0", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-General-Ministries-2026-2027.pdf",
 blocks:[["Major requirements",60,[...BRE_CORE_TOP,{el:"BSTH 2000-level courses",cr:6},{el:"BSTH 3000-level courses",cr:6},"CHRI 121",{el:"CHRI 2000-level courses",cr:9},"CHRI 394","CHRI 395",{el:"ENGL course",cr:3},CHRI_INTERN,{pick:1,of:["CHRI 221","CHRI 321"]},{pick:1,of:["CHRI 341","CHRI 361"]},{pick:1,of:["HIST 251","HIST 252"]},"PHIL 171"]],["Transfer credit",30,[{el:"Transfer courses",cr:18},{el:"Humanities / Social Science transfer courses",cr:12}]]], notes:["At least 24 of 90 credit hours at the 3000/4000 level. For students 25+ with ministry experience."]},
{id:"bre-pm", group:"Bachelor of Religious Education", name:"Pastoral Ministry", cred:"BRE", total:90, gpa:"2.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Pastoral-Ministry-2026-2027.pdf",
 blocks:[BRE_CORE,["Pastoral Ministry focus",15,["CHRI 121","CHRI 343","CHRI 344","CHRI 349",{pick:1,of:["CHRI 341","CHRI 346","CHRI 347"]}]],["Electives",12,[{free:12}]]], notes:["At least 24 of 90 credit hours must be at the 3000 or 4000 level."]},
{id:"bre-ym", group:"Bachelor of Religious Education", name:"Youth Ministry", cred:"BRE", total:90, gpa:"2.0", pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Youth-Ministry-2026-2027.pdf",
 blocks:[BRE_CORE,["Youth Ministry focus",15,["CHRI 121","CHRI 339","CHRI 344",{pick:2,of:["CHRI 331","CHRI 332","CHRI 338","CHRI 343"]}]],["Electives",12,[{free:12}]]], notes:["At least 24 of 90 credit hours must be at the 3000 or 4000 level."]},
// ---------- BSc 2+2
{id:"biol", group:"Bachelor of Science (2+2 with Redeemer)", name:"Biology (Honours)", cred:"BSc Honours", total:60, gpa:"C- min. per course", pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Biology-2026-2027.pdf",
 blocks:[SCI_CORE,["Science courses",45,["MATH 121","SOCI 101","BIOL 103","BIOL 104","BIOL 221","BIOL 231","CHEM 101","CHEM 102","MATH 111",{pick:1,of:["MATH 112","PHYS 101"]},"BIOL XXX",{el:"Elective (Humanities/Social Science, to reach 60 credit hours)",cr:12}]]], notes:["This tracks your two Tyndale years (60 credit hours). Years 3 and 4 are at Redeemer University.","BIOL XXX is Flora & Fauna of Southwestern Ontario — Tyndale hasn't assigned it a real course number yet."]},
{id:"hs-premed", group:"Bachelor of Science (2+2 with Redeemer)", name:"Health Sciences Pre-Medicine, Chemistry Minor", cred:"BSc", total:60, gpa:"C- min. per course", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Pre-Med-Chemistry-Minor-2026-2027.pdf",
 blocks:[SCI_CORE,["Science courses",45,["HEAL 301","PSYC 101","MATH 121","SOCI 101","BIOL 103","BIOL 104","BIOL 231","CHEM 101","CHEM 102","MATH 111","MATH 112","PHYS 101",{el:"Foundations of Human Anatomy I",cr:3},{el:"Foundations of Human Anatomy II",cr:3},{el:"Elective (to reach 60 credit hours)",cr:3}]]], notes:["Tracks your two Tyndale years. Years 3 and 4 are at Redeemer University.","Tyndale hasn't posted course codes for the two anatomy courses yet."]},
{id:"hs-prof", group:"Bachelor of Science (2+2 with Redeemer)", name:"Health Sciences Professional, Psychology Minor", cred:"BSc", total:60, gpa:"C- min. per course", pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Health-Science-Professional-Psychology-Minor-2026-2027.pdf",
 blocks:[SCI_CORE,["Science courses",45,["HEAL 301","PSYC 101","PSYC 102","MATH 121","SOCI 101","BIOL 103","BIOL 104","BIOL 231","CHEM 101","CHEM 102","PHYS 101",{el:"Foundations of Human Anatomy I",cr:3},{el:"Foundations of Human Anatomy II",cr:3},{el:"Elective (to reach 60 credit hours)",cr:6}]]], notes:["Tracks your two Tyndale years. Years 3 and 4 are at Redeemer University.","Tyndale hasn't posted course codes for the two anatomy courses yet."]},
];

const MINORS = [
{id:"m-bst", name:"Biblical Studies and Theology", total:24, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Biblical-Studies-and-Theology-2026-2027.pdf", rows:[...BSTH4,{el:"Old Testament course (BSTH 310–329)",cr:3},{el:"New Testament course (BSTH 330–349)",cr:3},{el:"Christian Theology course (BSTH 360–379)",cr:3},{el:"BSTH course",cr:3}]},
{id:"m-bus", name:"Business Administration", total:24, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Business-2026-2027.pdf", rows:["BUSI 101","BUSI 215","BUSI 231","BUSI 261","BUSI 262",{el:"BUSI 2000-level course",cr:3},{el:"BUSI 3000-level courses",cr:6}]},
{id:"m-child", name:"Children's Ministry", total:18, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Childrens-Ministry-2026-2027.pdf", rows:["CHRI 121","CHRI 322","CHRI 329","CHRI 344",{el:"CHRI courses or PSYC 211",cr:6}]},
{id:"m-apol", name:"Christian Apologetics", total:24, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Christian-Apologetics-2026-2027.pdf", rows:["PHIL 171","PHIL 201","PHIL 261","PHIL 294",{pick:1,of:["PHIL 321","PHIL 322"]},{el:"Approved apologetics electives",cr:9}], note:"Not open to Philosophy majors."},
{id:"m-engl", name:"English", total:24, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-English-2026-2027.pdf", rows:["ENGL 101","ENGL 102",{pick:1,of:["ENGL 262","ENGL 263"]},{el:"ENGL 3000-level courses",cr:6},{el:"ENGL courses",cr:9}]},
{id:"m-ethlaw", name:"Ethics and Law", total:24, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Ethics-and-Law-2026-2027.pdf", rows:["BUSI 321","PHIL 201","PHIL 243","PHIL 311","PHIL 328","PHIL 370",{pick:2,of:["BSTH 321","PHIL 213","PHIL 215","PHIL 313","PHIL 330","PHIL 481"]}], note:"Not open to Philosophy majors."},
{id:"m-hgs", name:"History and Global Studies", total:24, pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-History-and-Global-Studies-2026-2027.pdf", rows:["HIST 101","HIST 102",{el:"HIST 2000-level courses",cr:15},"HIST 301"]},
{id:"m-ics", name:"Intercultural Studies", total:18, pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Intercultural-Studies-2026-2027.pdf", rows:["CHRI 121","CHRI 344","CHRI 361","CHRI 369",{el:"CHRI or IDVP courses",cr:6}]},
{id:"m-ling", name:"Linguistics", total:24, pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Linguistics-2026-2027.pdf", rows:["LING 101","LING 102",{el:"LING 2000-level courses",cr:12},{el:"LING 3000-level courses",cr:6}]},
{id:"m-meda", name:"Media Arts", total:24, pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Media-Arts-Business-2026-2027.pdf", rows:[...MEDA_PROD1,...MEDA_PHIL,{el:"MEDA 3000-level courses",cr:9}]},
{id:"m-mwa", name:"Music and Worship Arts", total:24, pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Music-Worship-Arts-Minor-2026-2027.pdf", rows:["CHRI 346","CHRI 347","MUSC 101","MUSC 202","MUSC 369",{pick:1,of:["MUSC 1B1","MUSC 1C1","MUSC 1J1","MUSC 1S1"]},{el:"Applied Music or music elective",cr:2},{el:"MUSC, ARTM 310, ARTM 312 or CHRI 340",cr:6}]},
{id:"m-past", name:"Pastoral Ministry", total:18, pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Pastoral-Ministry-2026-2027.pdf", rows:["CHRI 121","CHRI 343","CHRI 344","CHRI 349",{el:"CHRI course, PSYC 211 or PSYC 212",cr:6}]},
{id:"m-phil", name:"Philosophy", total:24, pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Philosophy-2026-2027.pdf", rows:["PHIL 171","PHIL 201","PHIL 370",{el:"PHIL 2000-level courses",cr:6},{el:"PHIL 3000-level courses",cr:9}]},
{id:"m-psyc", name:"Psychology", total:24, pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Psychology-with-DCP-2026-2027.pdf", rows:["PSYC 101","PSYC 102",{el:"PSYC 2000-level courses",cr:6},{el:"PSYC 3000-level courses",cr:12}]},
{id:"m-soci", name:"Sociology", total:24, pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Sociology-2026-2027.pdf", rows:["SOCI 101","SOCI 102",{el:"SOCI 2000-level courses",cr:6},{el:"SOCI 3000-level courses",cr:12}]},
{id:"m-youth", name:"Youth Ministry", total:18, pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Youth-Ministry-2026-2027.pdf", rows:["CHRI 121","CHRI 339","CHRI 344",{pick:1,of:["CHRI 331","CHRI 332"]},{el:"CHRI courses or PSYC 211",cr:6}]},
];

const CONCENTRATIONS = [
{id:"engl-wc", name:"Writing and Communication", total:15, pdf:PDF+"2026-10/Tyndale-University-Program-Requirements-Writing-Communication-2026-2027.pdf", rows:[{pick:1,of:["ENGL 262","ENGL 263"]},"PHIL 201",{pick:3,of:["ARTM 340","ARTM 344","BUSI 203","ENGL 361","ENGL 363","ENGL 440","MEDA 212","MEDA 214","MEDA 280","MEDA 380","PHIL 323"]}], note:"On top of the English major. At least one of the three electives must be 3000/4000 level. The ENGL 262/263 choice cannot also count toward the English major's own ENGL 262/263 requirement."},
{id:"ling-bt", name:"Bible Translation", total:24, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Linguistics-Bible-Translation-2026-2027.pdf", rows:["CHRI 366","LING 405","LING 471","LING 475",{pick:4,of:["GREE 201","GREE 202","GREE 301","GREE 302","HEBR 201","HEBR 202","HEBR 301","HEBR 302"],oneTrack:true}]},
{id:"phil-apol", name:"Christian Apologetics", total:15, pdf:PDF+"2026-08/Tyndale-University-Program-Requirements-Christian-Apologetics-2026-2027.pdf", rows:["PHIL 261","PHIL 294",{el:"Approved apologetics electives",cr:9}], note:"On top of the Philosophy major. The sheet lists 15 credit hours of coursework but calls it \"12 hours\" net new, since two of the elective options can't double-count toward the major."},
{id:"phil-law", name:"Law", total:15, pdf:PDF+"2026-09/Tyndale-University-Program-Requirements-Philosophy-Law-2026-2027.pdf", rows:["BUSI 321","PHIL 243","PHIL 311","PHIL 328",{pick:1,of:["PHIL 213","PHIL 215","PHIL 313"]}], note:"On top of the Philosophy major. The sheet lists 15 credit hours of coursework but calls it \"12 hours\" net new, the same framing as the Apologetics concentration."},
];

const CREDIT_OVERRIDES = {"CHRI 308":9,"MUSC 335":2,"MUSC 369":2,"MUSC 390":1,"MUSC 490":2,"MUSC 491":2,"MUSC 411":2,"MUSC 421":2,"MUSC 441":2,"MUSC 1B1-4B8":1,"MUSC 1C1-4C8":1,"MUSC 1J1-4J8":1,"MUSC 1S1-4S8":1,"MUSC 1R1-4R8":1,"MUSC 1V1-4V8":2,"MUSC 1P1-4P8":2,"MUSC 1G1-4G8":2,"MUSC 1E1-4E8":2,"MUSC 1D1-4D8":2,"MUSC 1VL":1,"MUSC 1PL":1,"MUSC 1GL":1,"MUSC 1EL":1,"MUSC 1DL":1,"MUSC 1B1":2,"MUSC 1C1":2,"MUSC 1J1":2,"MUSC 1S1":2,"MEDA 4XX-INT":6,"MEDA 4XX-THS":6};

const TYNDALE_DATES = [
["2026-08-21","2026-08-21","Fall registration deadline","deadline"],
["2026-08-27","2026-08-27","First day of modular classes","term"],
["2026-09-07","2026-09-07","Labour Day","holiday"],
["2026-09-07","2026-09-09","New student orientation","term"],
["2026-09-10","2026-09-10","Fall classes begin","term"],
["2026-09-15","2026-09-15","Commencement Chapel","term"],
["2026-09-23","2026-09-23","Last day to add/drop Fall courses without penalty","deadline"],
["2026-10-12","2026-10-12","Thanksgiving (no classes)","holiday"],
["2026-10-13","2026-10-18","Reading days (no classes)","holiday"],
["2026-11-02","2026-11-02","Fall graduation","term"],
["2026-11-18","2026-11-18","Final day to drop a Fall course","deadline"],
["2026-12-04","2026-12-04","Spring graduation early application deadline","deadline"],
["2026-12-09","2026-12-09","Last day of Fall classes","term"],
["2026-12-10","2026-12-10","Reading day (no classes)","holiday"],
["2026-12-11","2026-12-11","Winter registration deadline","deadline"],
["2026-12-11","2026-12-18","Fall final exams","exam"],
["2026-12-24","2027-01-03","Tyndale closed","holiday"],
["2027-01-04","2027-01-08","January intersession","term"],
["2027-01-07","2027-01-07","First day of modular classes","term"],
["2027-01-11","2027-01-11","Winter classes begin","term"],
["2027-01-22","2027-01-22","Last day to add/drop Winter courses without penalty","deadline"],
["2027-01-31","2027-01-31","Spring graduation final application deadline","deadline"],
["2027-02-15","2027-02-15","Family Day (no classes)","holiday"],
["2027-02-16","2027-02-21","Reading days (no classes)","holiday"],
["2027-03-19","2027-03-19","Final day to drop a Winter course","deadline"],
["2027-03-26","2027-03-26","Good Friday (no classes or exams)","holiday"],
["2027-04-06","2027-04-06","Convocation Chapel","term"],
["2027-04-12","2027-04-12","Last day of Winter classes","term"],
["2027-04-13","2027-04-13","Reading day (no classes)","holiday"],
["2027-04-14","2027-04-22","Winter final exams","exam"],
["2027-05-29","2027-05-29","Spring Convocation, Arts & Sciences","term"],
];
const TERMS = [
{id:"F26", name:"Fall 2026", start:"2026-09-10", end:"2026-12-09"},
{id:"W27", name:"Winter 2027", start:"2027-01-11", end:"2027-04-12"},
];
