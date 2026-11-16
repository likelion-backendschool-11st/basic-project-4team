const pool = require('../config/db');

/** 트랜잭션 안에서만 쓰는 쿼리. 모두 같은 connection으로 실행한다. */
function createTx(connection) {
  return {
    /** 찜 추가. 새로 추가했으면 true, 이미 있었으면 false. */
    async insertWish(listingId, userId) {
      // INSERT IGNORE는 FK 오류까지 삼키고, ON DUPLICATE KEY UPDATE는 mysql2의 FOUND_ROWS 플래그 때문에
      // 중복이어도 affectedRows가 1로 나올 수 있다. 그래서 그냥 INSERT하고 PK 중복만 "이미 찜함"으로 본다.
      try {
        await connection.execute('INSERT INTO wishes (user_id, listing_id) VALUES (?, ?)', [userId, listingId]);
        return true;
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') return false;
        throw err;
      }
    },

    /** 찜 삭제. 실제로 지웠으면 true. 토큰의 사용자 찜만 지운다. */
    async deleteWish(listingId, userId) {
      const [result] = await connection.execute(
        'DELETE FROM wishes WHERE user_id = ? AND listing_id = ?',
        [userId, listingId],
      );
      return result.affectedRows === 1;
    },

    /** listings.wish_count를 delta(+1 / -1)만큼 바꾸고 바뀐 값을 돌려준다. 0 아래로는 내려가지 않는다. */
    async changeWishCount(listingId, delta) {
      await connection.execute(
        'UPDATE listings SET wish_count = GREATEST(CAST(wish_count AS SIGNED) + ?, 0) WHERE id = ?',
        [delta, listingId],
      );
      const [[row]] = await connection.execute('SELECT wish_count FROM listings WHERE id = ?', [listingId]);
      return row.wish_count;
    },
  };
}

/**
 * 판매글 행을 FOR UPDATE로 잠근 트랜잭션 안에서 work(listing, tx)를 실행한다.
 * 같은 판매글을 동시에 찜해도 wish_count가 어긋나지 않는다.
 * listing은 삭제된 판매글도 포함하며(deletedAt으로 구분), 없으면 null.
 * work가 throw하면 롤백한다.
 */
async function withListingLock(listingId, work) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      'SELECT id, seller_id, status, wish_count, deleted_at FROM listings WHERE id = ? FOR UPDATE',
      [listingId],
    );
    const listing = rows.length === 0
      ? null
      : {
        id: rows[0].id,
        sellerId: rows[0].seller_id,
        status: rows[0].status,
        wishCount: rows[0].wish_count,
        deletedAt: rows[0].deleted_at,
      };
    const result = await work(listing, createTx(connection));
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

module.exports = { withListingLock };
