import { Db } from 'mongodb';
import axios from 'axios';
import jsdom from 'jsdom';

import { SinhVienDangKy } from '../models/SinhVienDangKy';
import { ResponseEntity } from '../models/ResponseEntity';
import { utils } from '../utils/Utils';
import { dbFactory } from './DbFactory';

class SinhVienDangKyService {
    busy: boolean;
    setBusy(value: boolean) {
        this.busy = value;
    }
    async findStudentByTermAndMssv(term: string, mssv: number) {
        var db: Db = dbFactory.dbSinhVienDangKy;
        let filter = { mssv: mssv };
        let student = await db.collection(`${term}-student-register`).findOne(filter);
        return ResponseEntity.builder().code(1).message('success').data(student).build();
    }
    async crawlManyStudents(term: string, start: number, end: number, cookie: string) {
        var db: Db = dbFactory.dbSinhVienDangKy;
        this.setBusy(true);
        console.log('crawl start: ' + new Date().toTimeString());
        console.log({ term, start, end });

        var MIN_SIZE = 5;
        var MAX_SIZE = 20;
        var WINDOW_SIZE = MIN_SIZE;

        let CRASH = false;
        let collection = db.collection(`${term}-student-register`);

        let count = 0;
        let timer = Date.now();

        let iterator = start;
        while (!CRASH && iterator <= end) {
            let promises = [];
            for (let i = 0; i <= WINDOW_SIZE; i++, iterator++) {
                let timer = Date.now();

                let mssv = iterator; //CAUTION:không dùng iterator vì callback sẽ dùng sai
                let promise = this.crawlStudent(term, mssv, cookie)
                    .then(function (student: SinhVienDangKy) {
                        let took = Date.now() - timer;
                        if (took > 700 || took < 350) {
                            console.log(`window_size=${WINDOW_SIZE} mssv=${mssv} took=${took}`);
                            WINDOW_SIZE -= 2;
                            WINDOW_SIZE = Math.max(WINDOW_SIZE, MIN_SIZE);
                        } else {
                            WINDOW_SIZE += 1;
                            WINDOW_SIZE = Math.min(WINDOW_SIZE, MAX_SIZE);
                        }

                        if (student.hoTen) {
                            collection.updateOne({ mssv: mssv }, { $set: { ...student } }, { upsert: true });
                            count++;
                        }
                    })
                    .catch();

                promises.push(promise);
            }
            await Promise.all(promises);
        }
        if (CRASH) console.log('crash, mssv=' + iterator + ', err=' + CRASH);
        let took = Math.round((Date.now() - timer) / 60_000);
        let result = { took: took + 'min', count: count, mssv: iterator, err: CRASH };
        console.log(result);
        this.setBusy(false);
    }
    async crawlStudent(term: string, mssv: number, cookie: string) {
        const URL = 'https://ctt-sis.hust.edu.vn/pub/CheckClassRegister.aspx';
        const __VIEWSTATE =
            '/wEPDwUKMTgxNzUwMDI1OA9kFgJmD2QWAmYPZBYCAgMPZBYCAgEPZBYIAgEPPCsACAEADxYCHg5fIVVzZVZpZXdTdGF0ZWdkFgJmD2QWAmYPZBYCZg9kFgJmD2QWAmYPZBYCAgEPPCsABAEADxYCHg9EYXRhU291cmNlQm91bmRnZGQCAw88KwAIAQAPFgIfAGdkFgJmD2QWAgIBD2QWAmYPZBYEZg9kFgJmD2QWAgIBDzwrAAoBAA8WAh8AZ2RkAgEPZBYCZg9kFgJmD2QWAgIBDzwrAAoBAA8WBB8AZx8BZ2RkAgUPPCsACAEADxYCHwBnZGQCBw88KwAIAQAPFgIfAGdkFgJmD2QWAmYPZBYCZg9kFgJmD2QWAmYPZBYCAgEPZBYEAgMPPCsACAEADxYCHwBnZBYCZg9kFgICAQ9kFgJmD2QWAmYPZBYCAgEPFgIeBFRleHQF9Ro8ZGl2IGNsYXNzPSJsMzljb250ZW50TGVmdCI+PGRpdiBjbGFzcz0ibDM5TGVmdE1haW4iPjxoMz48aW1nIHNyYz0iLi5cQ29udGVudFxBbmhcYW5oXzIwMTgzNjU2LmpwZyIgc3R5bGU9IndpZHRoOjMwcHg7aGVpZ2h0OjMwcHg7Ym9yZGVyLXJhZGl1czogNTAlOyI+IE5ndXnhu4VuIE1pbmggVHXhuqVuPC9oMz48dWwgY2xhc3M9InNpdGVNYXAiPjxsaT48YSBocmVmPSIuLi9BY2NvdW50L05ld3NGZWVkLmFzcHgiPlRoxrAgYsOhbyA8c3BhbiBjbGFzcz0iYmFkZ2UiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiM5QzEwMTA7Ij4wPC9zcGFuPjwvYT48L2xpPjxsaT48YSBocmVmPSIuLi9BY2NvdW50L0NoYW5nZVBhc3N3b3JkLmFzcHgiPsSQ4buVaSBt4bqtdCBraOG6qXU8L2E+PC9saT48bGk+PGEgaHJlZj0iLi4vU3R1ZGVudHMvZ2V0TmV3RW1haWxQYXNzd29yZC5hc3B4Ij5UaMO0bmcgdGluIG3huq10IGto4bqpdSBt4bubaSB0w6BpIGtob+G6o24gRW1haWwgc2luaCB2acOqbjwvYT48L2xpPjxsaT48YSBocmVmPSIuLi9BY2NvdW50L0xvZ291dC5hc3B4Ij5UaG/DoXQgxJHEg25nIG5o4bqtcDwvYT48L2xpPjxsaT48YSBocmVmPSJodHRwczovL3ZicGwuaHVzdC5lZHUudm4vcmVzZXRwYXNzd29yZHMvIj7EkMSDbmcga8O9IMSR4buVaSBt4bqtdCBraOG6qXUgRW1haWwgc2luaCB2acOqbjwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+PGJyPjxkaXYgY2xhc3M9ImwzOWNvbnRlbnRMZWZ0Ij48ZGl2IGNsYXNzPSJsMzlMZWZ0TWFpbiI+PGgzPlF14bqjbiBsw70gaOG7kyBzxqEgc2luaCB2acOqbjwvaDM+PHVsIGNsYXNzPSJzaXRlTWFwIj48bGk+PGEgaHJlZj0iLi4vIj5UaMO0bmcgdGluIHNpbmggdmnDqm48L2E+PC9saT48bGk+PGEgaHJlZj0iLi4vU3R1ZGVudHMvdXBkYXRlU3R1ZGVudFByb2ZpbGVzLmFzcHgiPkPhuq1wIG5o4bqtdCB0aMO0bmcgdGluIGPDoSBuaMOibjwvYT48L2xpPjxsaT48YSBocmVmPSIuLi9TdHVkZW50cy9TdHVkZW50R3JvdXBJbmZvLmFzcHgiPlRow7RuZyB0aW4gbOG7m3Agc2luaCB2acOqbjwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+PGJyPjxkaXYgY2xhc3M9ImwzOWNvbnRlbnRMZWZ0Ij48ZGl2IGNsYXNzPSJsMzlMZWZ0TWFpbiI+PGgzPsSQw6BvIHThuqFvPC9oMz48dWwgY2xhc3M9InNpdGVNYXAiPjxsaSBjbGFzcz0iY29zdWIiPjxhIGhyZWY9ImphdmFzY3JpcHQ6dm9pZCgwKSI+Q2jGsMahbmcgdHLDrG5oIMSRw6BvIHThuqFvPC9hPjx1bCBjbGFzcz0ic3ViU2l0ZW1hcCI+PGxpPjxhIGhyZWY9Ii4uL1N0dWRlbnRzL1N0dWRlbnRQcm9ncmFtLmFzcHgiPkNoxrDGoW5nIHRyw6xuaCDEkcOgbyB04bqhbyBzaW5oIHZpw6puPC9hPjwvbGk+PGxpPjxhIGhyZWY9Ii4uL3B1Yi9Db3Vyc2VMaXN0cy5hc3B4Ij5EYW5oIG3hu6VjIGjhu41jIHBo4bqnbjwvYT48L2xpPjxsaT48YSBocmVmPSIuLi9wdWIvR3JvdXBMaXN0LmFzcHgiPlRyYSBj4bupdSBkYW5oIHPDoWNoIGzhu5twIFNWPC9hPjwvbGk+PC91bD48L2xpPjxsaSBjbGFzcz0iY29zdWIiPjxhIGhyZWY9ImphdmFzY3JpcHQ6dm9pZCgwKSI+S+G6vyBob+G6oWNoIGjhu41jIHThuq1wPC9hPjx1bCBjbGFzcz0ic3ViU2l0ZW1hcCI+PGxpPjxhIGhyZWY9Ii4uL1N0dWRlbnRzL0NvdXJzZXNSZWdpc3Rlci5hc3B4Ij7EkMSDbmcga8O9IGjhu41jIHBo4bqnbjwvYT48L2xpPjxsaT48YSBocmVmPSIuLi9TdHVkZW50cy9UaW1ldGFibGVzLmFzcHgiPlRo4budaSBraMOzYSBiaeG7g3U8L2E+PC9saT48bGk+PGEgaHJlZj0iLi4vcHViL0NoZWNrQ2xhc3NSZWdpc3Rlci5hc3B4Ij5UcmEgY+G7qXUgxJHEg25nIGvDvSBs4bubcCBjw6FjIGvhu7M8L2E+PC9saT48L3VsPjwvbGk+PGxpIGNsYXNzPSJjb3N1YiI+PGEgaHJlZj0iamF2YXNjcmlwdDp2b2lkKDApIj5L4bq/dCBxdeG6oyBo4buNYyB04bqtcDwvYT48dWwgY2xhc3M9InN1YlNpdGVtYXAiPjxsaT48YSBocmVmPSIuLi9TdHVkZW50cy9Ub2VpY01hcmtzLmFzcHgiPkvhur90IHF14bqjIHRoaSBUT0VJQzwvYT48L2xpPjxsaT48YSBocmVmPSIuLi9TdHVkZW50cy9TdHVkZW50Q291cnNlTWFya3MuYXNweCI+QuG6o25nIMSRaeG7g20gY8OhIG5ow6JuPC9hPjwvbGk+PGxpPjxhIGhyZWY9Ii4uL1N0dWRlbnRzL1N0dWRlbnRDb3Vyc2VHcmFkZS5hc3B4Ij5C4bqjbmcgxJFp4buDbSBo4buNYyBwaOG6p248L2E+PC9saT48bGk+PGEgaHJlZj0iLi4vU3R1ZGVudHMvU3R1ZGVudENoZWNrSW5wdXRHcmFkZVRlcm0uYXNweCI+S2nhu4NtIHRyYSBuaOG6rXAgxJFp4buDbSBr4buzIG3hu5tpIG5o4bqldDwvYT48L2xpPjwvdWw+PC9saT48bGkgY2xhc3M9ImNvc3ViIj48YSBocmVmPSJqYXZhc2NyaXB0OnZvaWQoMCkiPsSQ4buTIMOhbiAtIFThu5F0IG5naGnhu4dwPC9hPjx1bCBjbGFzcz0ic3ViU2l0ZW1hcCI+PGxpPjxhIGhyZWY9Ii4uL1N0dWRlbnRzL0ZpbmFsUHJvamVjdFJlZ2lzdGVyUmVzdWx0LmFzcHgiPkvhur90IHF14bqjIHjDqXQgbmjhuq1uIMSQQVROPC9hPjwvbGk+PGxpPjxhIGhyZWY9Ii4uL1N0dWRlbnRzL0dyYWR1YXRlUmVnaXN0ZXIuYXNweCI+xJDEg25nIGvDvSB4w6l0IHThu5F0IG5naGnhu4dwPC9hPjwvbGk+PC91bD48L2xpPjxsaT48YSBocmVmPSIuLi9TdHVkZW50cy9UaW1ldGFibGVzVGVtcC5hc3B4Ij5UaOG7nWkga2jDs2EgYmnhu4N1IHThuqFtIHRo4budaTwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+PGJyPjxkaXYgY2xhc3M9ImwzOWNvbnRlbnRMZWZ0Ij48ZGl2IGNsYXNzPSJsMzlMZWZ0TWFpbiI+PGgzPlTGsCB24bqlbiB0cuG7sWMgdHV54bq/bjwvaDM+PHVsIGNsYXNzPSJzaXRlTWFwIj48bGk+PGEgaHJlZj0iLi4vU3R1ZGVudHMvUUEuYXNweCI+SOG7j2kgxJHDoXAgLSBUxrAgduG6pW4gdHLhu7FjIHR1eeG6v248L2E+PC9saT48L3VsPjwvZGl2PjwvZGl2Pjxicj48ZGl2IGNsYXNzPSJsMzljb250ZW50TGVmdCI+PGRpdiBjbGFzcz0ibDM5TGVmdE1haW4iPjxoMz5Uw6BpIGNow61uaCBo4buNYyB24bulPC9oMz48dWwgY2xhc3M9InNpdGVNYXAiPjxsaT48YSBocmVmPSIuLi9TdHVkZW50cy9DaGVja1R1aXRpb24uYXNweCI+VGjDtG5nIHRpbiBjw7RuZyBu4bujIGjhu41jIHBow608L2E+PC9saT48bGk+PGEgaHJlZj0iLi4vU3R1ZGVudHMvT25saW5lX1R1aXRpb25QYXkuYXNweCI+VGhhbmggdG/DoW4gaOG7jWMgcGjDrSB0cuG7sWMgdHV54bq/bjwvYT48L2xpPjwvdWw+PC9kaXY+PC9kaXY+PGJyPjxkaXYgY2xhc3M9ImwzOWNvbnRlbnRMZWZ0Ij48ZGl2IGNsYXNzPSJsMzlMZWZ0TWFpbiI+PGgzPkThu4tjaCB24bulIGjDoG5oIGNow61uaDwvaDM+PHVsIGNsYXNzPSJzaXRlTWFwIj48bGk+PGEgaHJlZj0iaHR0cDovL2N0c3YuaHVzdC5lZHUudm4vIy9naWF5LXRvL3hpbi1jYXAtZ2lheSI+xJBLIGPhuqVwIGdp4bqleSB04budPC9hPjwvbGk+PC91bD48L2Rpdj48L2Rpdj48YnI+ZAIHD2QWBAIDDxQrAAYPFgQfAWceBVZhbHVlBQUyMDIxMWRkZDwrAA8BDhQrAAYWAh4nRW5hYmxlU3luY2hyb25pemF0aW9uT25QZXJmb3JtQ2FsbGJhY2sgaGRkDxYCHgpJc1NhdmVkQWxsZw8UKwAxFCsAARYIHwIFBTIwMjExHwMFBTIwMjExHghJbWFnZVVybGUeDlJ1bnRpbWVDcmVhdGVkZxQrAAEWCB8CBQUyMDIwMx8DBQUyMDIwMx8GZR8HZxQrAAEWCB8CBQUyMDIwMh8DBQUyMDIwMh8GZR8HZxQrAAEWCB8CBQUyMDIwMR8DBQUyMDIwMR8GZR8HZxQrAAEWCB8CBQUyMDE5Mx8DBQUyMDE5Mx8GZR8HZxQrAAEWCB8CBQUyMDE5Mh8DBQUyMDE5Mh8GZR8HZxQrAAEWCB8CBQUyMDE5MR8DBQUyMDE5MR8GZR8HZxQrAAEWCB8CBQUyMDE4Mx8DBQUyMDE4Mx8GZR8HZxQrAAEWCB8CBQUyMDE4Mh8DBQUyMDE4Mh8GZR8HZxQrAAEWCB8CBQUyMDE4MR8DBQUyMDE4MR8GZR8HZxQrAAEWCB8CBQUyMDE3Mx8DBQUyMDE3Mx8GZR8HZxQrAAEWCB8CBQUyMDE3Mh8DBQUyMDE3Mh8GZR8HZxQrAAEWCB8CBQUyMDE3MR8DBQUyMDE3MR8GZR8HZxQrAAEWCB8CBQUyMDE2Mx8DBQUyMDE2Mx8GZR8HZxQrAAEWCB8CBQUyMDE2Mh8DBQUyMDE2Mh8GZR8HZxQrAAEWCB8CBQUyMDE2MR8DBQUyMDE2MR8GZR8HZxQrAAEWCB8CBQUyMDE1Mx8DBQUyMDE1Mx8GZR8HZxQrAAEWCB8CBQUyMDE1Mh8DBQUyMDE1Mh8GZR8HZxQrAAEWCB8CBQUyMDE1MR8DBQUyMDE1MR8GZR8HZxQrAAEWCB8CBQUyMDE0Mx8DBQUyMDE0Mx8GZR8HZxQrAAEWCB8CBQUyMDE0Mh8DBQUyMDE0Mh8GZR8HZxQrAAEWCB8CBQUyMDE0MR8DBQUyMDE0MR8GZR8HZxQrAAEWCB8CBQUyMDEzMx8DBQUyMDEzMx8GZR8HZxQrAAEWCB8CBQUyMDEzMh8DBQUyMDEzMh8GZR8HZxQrAAEWCB8CBQUyMDEzMR8DBQUyMDEzMR8GZR8HZxQrAAEWCB8CBQUyMDEyMx8DBQUyMDEyMx8GZR8HZxQrAAEWCB8CBQUyMDEyMh8DBQUyMDEyMh8GZR8HZxQrAAEWCB8CBQUyMDEyMR8DBQUyMDEyMR8GZR8HZxQrAAEWCB8CBQUyMDExMx8DBQUyMDExMx8GZR8HZxQrAAEWCB8CBQUyMDExMh8DBQUyMDExMh8GZR8HZxQrAAEWCB8CBQUyMDExMR8DBQUyMDExMR8GZR8HZxQrAAEWCB8CBQUyMDEwMx8DBQUyMDEwMx8GZR8HZxQrAAEWCB8CBQUyMDEwMh8DBQUyMDEwMh8GZR8HZxQrAAEWCB8CBQUyMDEwMR8DBQUyMDEwMR8GZR8HZxQrAAEWCB8CBQUyMDA5Mx8DBQUyMDA5Mx8GZR8HZxQrAAEWCB8CBQUyMDA5Mh8DBQUyMDA5Mh8GZR8HZxQrAAEWCB8CBQUyMDA5MR8DBQUyMDA5MR8GZR8HZxQrAAEWCB8CBQUyMDA4Mx8DBQUyMDA4Mx8GZR8HZxQrAAEWCB8CBQUyMDA4Mh8DBQUyMDA4Mh8GZR8HZxQrAAEWCB8CBQUyMDA4MR8DBQUyMDA4MR8GZR8HZxQrAAEWCB8CBQUyMDA3Mx8DBQUyMDA3Mx8GZR8HZxQrAAEWCB8CBQUyMDA3Mh8DBQUyMDA3Mh8GZR8HZxQrAAEWCB8CBQUyMDA3MR8DBQUyMDA3MR8GZR8HZxQrAAEWCB8CBQUyMDA2Mx8DBQUyMDA2Mx8GZR8HZxQrAAEWCB8CBQUyMDA2Mh8DBQUyMDA2Mh8GZR8HZxQrAAEWCB8CBQUyMDA2MR8DBQUyMDA2MR8GZR8HZxQrAAEWCB8CBQUyMDA1Mx8DBQUyMDA1Mx8GZR8HZxQrAAEWCB8CBQUyMDA1Mh8DBQUyMDA1Mh8GZR8HZxQrAAEWCB8CBQUyMDA1MR8DBQUyMDA1MR8GZR8HZ2RkZGRkZAILDzwrACYCBg9kEBYKZgIBAgICAwIEAgUCBgIHAggCCRYKPCsADAEAFgIeC0dsb2JhbEluZGV4ZjwrAAwBABYCHwgCATwrAAwBABYCHwgCAjwrAAwBABYCHwgCAzwrAAwBABYCHwgCBDwrAAwBABYCHwgCBTwrAAwBABYCHwgCBjwrAAwBABYCHwgCBzwrAAwBABYCHwgCCDwrAAwBABYCHwgCCQ8WCgIBAgECAgIBAgECAQIBAgECAQIBFgIFe0RldkV4cHJlc3MuV2ViLkdyaWRWaWV3RGF0YUNvbHVtbiwgRGV2RXhwcmVzcy5XZWIudjE5LjIsIFZlcnNpb249MTkuMi4zLjAsIEN1bHR1cmU9bmV1dHJhbCwgUHVibGljS2V5VG9rZW49Yjg4ZDE3NTRkNzAwZTQ5YQV/RGV2RXhwcmVzcy5XZWIuR3JpZFZpZXdEYXRhRGF0ZUNvbHVtbiwgRGV2RXhwcmVzcy5XZWIudjE5LjIsIFZlcnNpb249MTkuMi4zLjAsIEN1bHR1cmU9bmV1dHJhbCwgUHVibGljS2V5VG9rZW49Yjg4ZDE3NTRkNzAwZTQ5YRg8KwAHAQUUKwACZGRkGAEFHl9fQ29udHJvbHNSZXF1aXJlUG9zdEJhY2tLZXlfXxYGBR9jdGwwMCRjdGwwMCRUb3BNZW51UGFuZSRtZW51VG9wBSVjdGwwMCRjdGwwMCRUb3BNZW51UGFuZSRjdGwxMCRtZW51VG9wBTpjdGwwMCRjdGwwMCRjb250ZW50UGFuZSRNYWluUGFuZWwkTWFpbkNvbnRlbnQkY2JUZXJtSUQkREREBTZjdGwwMCRjdGwwMCRjb250ZW50UGFuZSRNYWluUGFuZWwkTWFpbkNvbnRlbnQkYnRTZWFyY2gFP2N0bDAwJGN0bDAwJGNvbnRlbnRQYW5lJE1haW5QYW5lbCRNYWluQ29udGVudCRndlN0dWRlbnRSZWdpc3RlcgVTY3RsMDAkY3RsMDAkY29udGVudFBhbmUkTWFpblBhbmVsJE1haW5Db250ZW50JGd2U3R1ZGVudFJlZ2lzdGVyJGN0bDAwJERYRWRpdG9yMiRERERRUi9t86t/UkEpd5QlgK/R2s2QFE01inhrTRJyLEBsiA==';
        const HEADERS = {
            'Content-Type': 'application/x-www-form-urlencoded',
            Host: 'ctt-sis.hust.edu.vn',
            Origin: 'https://ctt-sis.hust.edu.vn',
            Cookie: cookie,
            Referer: 'https://ctt-sis.hust.edu.vn/pub/CheckClassRegister.aspx',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36'
        };
        let form = new URLSearchParams();
        form.append('ctl00_ctl00_contentPane_MainPanel_MainContent_cbTermID_VI', term);
        form.append('ctl00$ctl00$contentPane$MainPanel$MainContent$cbTermID', term);
        form.append('ctl00$ctl00$contentPane$MainPanel$MainContent$tbStudentID', String(mssv));
        form.append('__CALLBACKID', 'ctl00$ctl00$contentPane$MainPanel$MainContent$gvStudentRegister');
        form.append('__CALLBACKPARAM', `c0:KV|2;[];GB|27;14|CUSTOMCALLBACK8|${mssv};`);
        form.append('__VIEWSTATE', __VIEWSTATE);

        return new Promise(function (resolve, reject) {
            let timeout = setTimeout(reject, 15_000);
            axios.post(URL, form, { headers: HEADERS }).then(async function (resp) {
                try {
                    let student = new SinhVienDangKy();
                    student._timestamp = Date.now();

                    const document = new jsdom.JSDOM(resp.data).window.document;
                    let table = document.getElementById(
                        'ctl00_ctl00_contentPane_MainPanel_MainContent_gvStudentRegister_DXMainTable'
                    );
                    let rows = Array.from(table.querySelectorAll('.dxgvDataRow_Mulberry'));

                    rows.forEach(function (row) {
                        let columns = row.querySelectorAll('.dxgv');

                        student.hoTen = utils.reformatString(columns[2].textContent);
                        student.ngaySinh = utils.reformatString(columns[3].textContent);

                        let dangKi = new SinhVienDangKy.DangKy();
                        dangKi.maLop = utils.fromAnyToNumber(utils.reformatString(columns[4].textContent));
                        dangKi.nhom = utils.reformatString(columns[5].textContent);
                        dangKi.maLopThi = utils.fromAnyToNumber(utils.reformatString(columns[9].textContent));

                        student.addDangKy(dangKi);
                    });
                    resolve(student);
                } catch (e) {
                    reject(e);
                }
                clearTimeout(timeout);
            });
        });
    }
}

export const sinhVienDangKyService = new SinhVienDangKyService();
